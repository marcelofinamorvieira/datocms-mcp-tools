# Confirmation Parameter Handling Guide

This guide explains best practices for handling confirmation parameters in destructive operations within the DatoCMS MCP server.

## Overview

Destructive operations (delete, reset, etc.) require explicit confirmation to prevent accidental data loss. The DatoCMS MCP server uses a dedicated schema type for these confirmations.

## Schema Definition

The `destructiveConfirmationSchema` is defined in `sharedSchemas.ts`:

```typescript
/**
 * Boolean confirmation for destructive operations
 * Requires explicit true value for confirmation
 */
export const destructiveConfirmationSchema = z.literal(true)
  .describe(
    "Explicit confirmation that you want to perform this destructive action. Must be set to true. This action cannot be undone."
  );
```

This schema only accepts the literal value `true` as valid confirmation.

## How to Use in Schema Definitions

When defining schemas for destructive operations, use the `createDeleteSchema` factory function:

```typescript
// In your schema file
export const schemas = {
  // ...
  delete_entity: createDeleteSchema("entity"),
  // ...
};
```

This will automatically include the `confirmation` parameter with `destructiveConfirmationSchema`.

If you need to define a custom schema with confirmation:

```typescript
const resetPasswordSchema = createBaseSchema().extend({
  userId: z.string().min(1),
  confirmation: destructiveConfirmationSchema
});
```

## Proper Handler Implementation

When implementing handlers for schemas with confirmation parameters, follow these guidelines:

### 1. Type Handler Parameters Correctly

Use type inference from the schema:

```typescript
import type { z } from "zod";
import type { schemas } from "../schemas.js";

export const deleteEntityHandler = async (args: z.infer<typeof schemas.delete_entity>) => {
  // ...
};
```

### 2. Check Confirmation with Strict Equality

**DO NOT** use truthiness checks:

```typescript
// ❌ WRONG: Truthiness check
if (!confirmation) {
  return createErrorResponse("Confirmation required");
}
```

**DO** use strict equality:

```typescript
// ✅ CORRECT: Strict equality check
if (confirmation !== true) {
  return createErrorResponse("Confirmation required");
}
```

### 3. Type Assertions for API Client Calls

When passing parameters to API clients, use type assertions:

```typescript
// First, extract parameters
const { apiToken, entityId, confirmation, environment } = args;

// Check confirmation
if (confirmation !== true) {
  return createErrorResponse("Confirmation required");
}

// Initialize client with type assertions
const client = getClient(apiToken as string, environment as string);

// Use type assertions for parameters to API methods
await client.entities.destroy(entityId as string);
```

## Common Errors and Solutions

### Type Errors in Handler Files

#### Error 1: Boolean not assignable to string
```
Argument of type 'string | true' is not assignable to parameter of type 'string'.
  Type 'boolean' is not assignable to type 'string'.
```

This occurs in client method calls. Use a type assertion:
```typescript
// Fix:
client.entities.destroy(entityId as string);
```

#### Error 2: Parameter type mismatch
```
Argument of type '{ apiToken: string; entityId: string; confirmation: boolean; }' is not assignable to...
```

Make sure your handler is typed correctly:
```typescript
// Fix:
export const handler = async (args: z.infer<typeof schemas.delete_entity>) => {
  // ...
};
```

## Migration from String Confirmation

If you're migrating from string-based confirmation:

### Old Approach
```typescript
// Schema
const deleteSchema = z.object({
  // ...
  confirmation: z.string().refine(val => val === "yes", {
    message: "Must type 'yes' to confirm"
  })
});

// Handler
if (confirmation !== "yes") {
  return createErrorResponse("Must type 'yes' to confirm");
}
```

### New Approach
```typescript
// Schema
const deleteSchema = createDeleteSchema("entity");

// Handler
if (confirmation !== true) {
  return createErrorResponse("Confirmation required. Set 'confirmation: true' to proceed.");
}
```

## Testing Confirmation Parameters

When writing tests for handlers with confirmation parameters:

```typescript
// Test a rejection without confirmation
it("should reject when confirmation is missing", async () => {
  const result = await handler({
    apiToken: "test-token",
    entityId: "123",
    // confirmation is missing
  });
  expect(result.error).toBeTruthy();
});

// Test a rejection with incorrect confirmation
it("should reject when confirmation is not true", async () => {
  const result = await handler({
    apiToken: "test-token",
    entityId: "123",
    confirmation: "yes" as any, // Wrong type
  });
  expect(result.error).toBeTruthy();
});

// Test acceptance with proper confirmation
it("should proceed when confirmation is true", async () => {
  const result = await handler({
    apiToken: "test-token",
    entityId: "123",
    confirmation: true,
  });
  expect(result.error).toBeFalsy();
});
```

## Best Practices Summary

1. **Always use literal `true`**: Only accept the literal `true` value for confirmations
2. **Use strict equality checks**: Always check with `confirmation !== true`
3. **Add clear error messages**: Specify that `confirmation: true` is required
4. **Add type assertions**: Use `as string` for parameters passed to API clients
5. **Use schema factories**: Prefer `createDeleteSchema` for consistency