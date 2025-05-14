# Advanced Schema Validation

This document describes advanced validation patterns available in the DatoCMS MCP server schema system.

## Relationship Validations

### Dependent Fields

Require a field when another field is present:

```typescript
import { requireDependentField } from "../utils/advancedValidation.js";

const schema = z.object({
  itemType: z.string(),
  orderingField: z.string().optional(),
  orderingDirection: z.enum(["asc", "desc"]).optional()
});

// Make orderingDirection required when orderingField is provided
const enhancedSchema = requireDependentField(
  schema,
  "orderingField",
  "orderingDirection",
  { message: "Ordering direction is required when ordering field is specified" }
);
```

### Mutually Exclusive Fields

Ensure only one of several fields is provided:

```typescript
import { mutuallyExclusive } from "../utils/advancedValidation.js";

const schema = z.object({
  url: z.string().url().optional(),
  path: z.string().optional(),
  content: z.string().optional()
});

// Ensure only one source is provided
const enhancedSchema = mutuallyExclusive(
  schema,
  ["url", "path", "content"],
  { message: "Provide only one of: url, path, or content" }
);
```

### Mutually Inclusive Fields

Ensure either all specified fields are present or none are:

```typescript
import { mutuallyInclusive } from "../utils/advancedValidation.js";

const schema = z.object({
  content_in_locales: z.array(z.string()).optional(),
  non_localized_content: z.boolean().optional()
});

// Ensure both or neither fields are provided
const enhancedSchema = mutuallyInclusive(
  schema,
  ["content_in_locales", "non_localized_content"],
  { message: "content_in_locales and non_localized_content must be provided together" }
);
```

### At Least One Required

Ensure at least one of several fields is present:

```typescript
import { atLeastOne } from "../utils/advancedValidation.js";

const schema = z.object({
  modelId: z.string().optional(),
  modelName: z.string().optional(),
  ids: z.string().optional()
});

// Ensure at least one filter is provided
const enhancedSchema = atLeastOne(
  schema,
  ["modelId", "modelName", "ids"],
  { message: "At least one of modelId, modelName, or ids must be provided" }
);
```

## Conditional Validation

Apply validation rules conditionally based on field values:

```typescript
import { conditional } from "../utils/advancedValidation.js";

const schema = z.object({
  field_type: z.enum(["string", "text", "integer", "float"]),
  validators: z.record(z.unknown()).optional()
});

// Apply specific validator schema based on field type
const enhancedSchema = conditional(
  schema,
  data => data.field_type === "string",
  z.object({
    validators: z.object({
      required: z.boolean().optional(),
      length: z.object({
        min: z.number().optional(),
        max: z.number().optional()
      }).optional()
    }).optional()
  }),
  z.object({
    validators: z.object({
      required: z.boolean().optional()
    }).optional()
  })
);
```

## Dependent Value Validation

Validate a field's value based on another field:

```typescript
import { dependentValues } from "../utils/advancedValidation.js";

const schema = z.object({
  adapter: z.enum(["vercel", "netlify", "custom"]),
  adapter_settings: z.record(z.unknown())
});

// Validate adapter_settings based on adapter type
const enhancedSchema = dependentValues(
  schema,
  "adapter_settings",
  "adapter",
  adapter => {
    // Return expected keys based on adapter
    switch (adapter) {
      case "vercel":
        return ["project_id", "deploy_hook_url"];
      case "netlify":
        return ["site_id", "build_hook_id"];
      case "custom":
        return ["url"];
      default:
        return [];
    }
  },
  { message: "Invalid adapter settings for this adapter type" }
);
```

## Value Transformations

Transform values based on related fields:

```typescript
import { transformDependentField } from "../utils/advancedValidation.js";

const schema = z.object({
  version: z.enum(["published", "current"]).default("current"),
  returnAllLocales: z.boolean().optional().default(false)
});

// Transform to include locale settings based on version
const enhancedSchema = transformDependentField(
  schema,
  data => ({
    ...data,
    locales: data.returnAllLocales ? "all" : "primary",
    version_type: data.version === "published" ? "published" : "draft"
  })
);
```

## Combining Validation Patterns

These validation patterns can be combined for complex validation scenarios:

```typescript
const schema = z.object({
  apiToken: z.string(),
  environment: z.string().optional(),
  itemId: z.string().optional(),
  itemType: z.string().optional(),
  data: z.record(z.unknown()).optional()
});

// Chain multiple advanced validations
const enhancedSchema = atLeastOne(
  mutuallyExclusive(
    requireDependentField(
      schema,
      "itemType",
      "data"
    ),
    ["itemId", "itemType"]
  ),
  ["itemId", "itemType"]
);
```

## Usage with Factory Functions

The advanced validation patterns work seamlessly with the `createSchema` factory:

```typescript
import { createSchema } from "../utils/schemaRegistry.js";
import { atLeastOne } from "../utils/advancedValidation.js";

const baseSchema = createSchema({
  modelId: z.string().optional(),
  modelName: z.string().optional()
});

const enhancedSchema = atLeastOne(
  baseSchema,
  ["modelId", "modelName"]
);
```

## Error Handling

All advanced validation patterns produce structured error messages that integrate with Zod's error reporting system. Custom error messages can be provided through the `options` parameter.