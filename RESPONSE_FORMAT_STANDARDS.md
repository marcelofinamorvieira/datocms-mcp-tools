# Response Format Standards

This document outlines the standard response formats for the DatoCMS MCP server codebase to ensure consistency across all domains and handlers.

## Core Principles

1. **Consistency** - All responses should follow the same structural pattern
2. **Predictability** - Consumers should know what to expect from responses
3. **Clarity** - Response formats should clearly communicate success or failure
4. **Extensibility** - The format should allow for domain-specific extensions

## Standard Response Interface

All handlers should return responses conforming to this interface:

```typescript
/**
 * Standard response format for all MCP handlers
 */
export interface StandardResponse<T = unknown> {
  /**
   * Whether the operation was successful
   */
  success: boolean;
  
  /**
   * Response data (only present on success)
   */
  data?: T;
  
  /**
   * Error message (only present on failure)
   */
  error?: string;
  
  /**
   * Informational message (can be present on success or failure)
   */
  message?: string;
  
  /**
   * Additional metadata about the response
   */
  meta?: ResponseMetadata;
}

/**
 * Standard metadata for responses
 */
export interface ResponseMetadata {
  /**
   * Pagination information (only for list operations)
   */
  pagination?: PaginationInfo;
  
  /**
   * Domain-specific metadata
   */
  [key: string]: unknown;
}

/**
 * Standard pagination information
 */
export interface PaginationInfo {
  /**
   * Number of items per page
   */
  limit: number;
  
  /**
   * Starting position (zero-based)
   */
  offset: number;
  
  /**
   * Total number of items
   */
  total: number;
  
  /**
   * Whether there are more items beyond the current page
   */
  has_more: boolean;
}
```

## Success Response Format

Success responses should follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message",
  "meta": {
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 42,
      "has_more": true
    },
    "additional_info": { ... }
  }
}
```

For list operations, responses should include:

```json
{
  "success": true,
  "data": [ ... ],
  "message": "Found 42 record(s) matching your query.",
  "meta": {
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 42,
      "has_more": true
    }
  }
}
```

For operations that return specific resource types:

```json
{
  "success": true,
  "data": {
    "id": "123abc",
    "title": "Example Resource",
    ...
  },
  "message": "Resource successfully retrieved."
}
```

## Error Response Format

Error responses should follow this format:

```json
{
  "success": false,
  "error": "Detailed error message",
  "meta": {
    "error_code": "NOT_FOUND",
    "error_details": { ... }
  }
}
```

For validation errors:

```json
{
  "success": false,
  "error": "Validation failed for field 'title': String must be at least 3 characters long",
  "meta": {
    "validation_errors": [
      {
        "path": "title",
        "message": "String must be at least 3 characters long"
      }
    ]
  }
}
```

## Domain-Specific Response Types

Domains may extend the standard response with domain-specific schemas, but must maintain the basic structure:

```typescript
/**
 * Record-specific response format
 */
export interface RecordResponse extends StandardResponse<Record> {
  // Can add record-specific fields here
}
```

## Standard Helper Functions

The following helper functions should be used to create responses:

```typescript
/**
 * Creates a standard success response
 */
export function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  meta?: Partial<ResponseMetadata>
): StandardResponse<T>;

/**
 * Creates a standard error response
 */
export function createErrorResponse(
  error: string | Error,
  meta?: Partial<ResponseMetadata>
): StandardResponse<never>;

/**
 * Creates a standard paginated response
 */
export function createPaginatedResponse<T>(
  items: T[],
  pagination: PaginationInfo,
  message?: string,
  meta?: Omit<ResponseMetadata, 'pagination'>
): StandardResponse<T[]>;
```

## Pagination Standards

All list operations must use standard pagination parameters:

```typescript
/**
 * Standard pagination parameters
 */
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional()
});
```

Pagination information must be included in all list operation responses:

```typescript
const paginationInfo = {
  limit: limit ?? 10, // Default to 10 if not specified
  offset: offset ?? 0, // Default to 0 if not specified
  total: totalCount,   // Total number of items matching the query
  has_more: (offset + limit) < totalCount // Whether there are more items
};
```

## Implementation Steps

1. Update `responseHandlers.ts` to implement standard response interfaces and helper functions
2. Update `errorHandlers.ts` to ensure consistent error formatting
3. Update `pagination.ts` to ensure consistent pagination handling
4. Create response format validation utilities
5. Migrate existing handlers to use the standard format
   - Start with high-impact/frequently used handlers
   - Update handler factories to use the new format
   - Progressively migrate domain-specific handlers

## Backward Compatibility

During migration, maintain backward compatibility:
1. Ensure new response formats can be converted to old formats if needed
2. Document any breaking changes
3. Maintain dual-format support during transition period

## Response Format Validation

A validation utility will be created to verify responses match the standard format:

```typescript
/**
 * Validates that a response matches the standard format
 */
export function validateResponseFormat(response: unknown): boolean;
```

This can be used in tests to ensure all handlers produce standardized responses.