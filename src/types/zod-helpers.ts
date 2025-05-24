/**
 * Zod helper utilities for type inference and schema creation
 * These utilities help bridge the gap between Zod schemas and TypeScript types
 */

import { z } from 'zod';

/**
 * Extract the inferred type from a Zod schema
 * This is a more explicit version of z.infer for clarity
 */
export type InferSchema<T> = T extends z.ZodType<infer U> ? U : never;

/**
 * Create a typed schema function that ensures bidirectional type safety
 * between TypeScript types and Zod schemas
 * 
 * Usage:
 * ```typescript
 * const createFieldSchema = createTypedSchema<SimpleSchemaTypes.FieldCreateSchema>();
 * const schema = createFieldSchema(z.object({ ... }));
 * ```
 */
export function createTypedSchema<T>() {
  return <S extends z.ZodType<T, any, any>>(schema: S): S => schema;
}

/**
 * Helper to create a schema that matches a partial version of a type
 * Useful for update operations where not all fields are required
 */
export function createPartialSchema<T>() {
  return <S extends z.ZodType<Partial<T>, any, any>>(schema: S): S => schema;
}

/**
 * Type-safe schema extension helper
 * Allows extending a base schema while maintaining type safety
 */
export function extendSchema<TBase extends z.ZodObject<any>, TExtension extends z.ZodRawShape>(
  baseSchema: TBase,
  extension: TExtension
): z.ZodObject<TBase['shape'] & TExtension> {
  return baseSchema.extend(extension);
}

/**
 * Create an optional field with a specific type
 * Handles the common pattern of optional fields in DatoCMS
 */
export function optionalField<T extends z.ZodType<any, any, any>>(schema: T) {
  return schema.optional().nullable();
}

/**
 * Create a required field that cannot be null
 * Enforces non-nullable required fields
 */
export function requiredField<T extends z.ZodType<any, any, any>>(schema: T) {
  return schema;
}

/**
 * Helper to create enum schemas from string literal unions
 * Provides better type inference than z.enum
 */
export function createEnumSchema<T extends readonly [string, ...string[]]>(values: T) {
  return z.enum(values);
}

/**
 * Type guard to check if a value matches a Zod schema
 * Returns a type predicate for use in conditional logic
 */
export function matchesSchema<T>(
  schema: z.ZodType<T>,
  value: unknown
): value is T {
  const result = schema.safeParse(value);
  return result.success;
}

/**
 * Parse with default value fallback
 * Useful for optional configurations
 */
export function parseWithDefault<T>(
  schema: z.ZodType<T>,
  value: unknown,
  defaultValue: T
): T {
  const result = schema.safeParse(value);
  return result.success ? result.data : defaultValue;
}

/**
 * Create a schema for DatoCMS identifiers (UUIDs in base64 format)
 */
export const datoCMSIdSchema = z.string()
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid DatoCMS ID format')
  .describe('DatoCMS identifier (RFC 4122 UUID in URL-safe base64)');

/**
 * Common Zod schemas for DatoCMS types
 */
export const commonSchemas = {
  apiToken: z.string().min(1).describe('DatoCMS API token for authentication'),
  environment: z.string().optional().describe('DatoCMS environment (defaults to primary)'),
  itemTypeId: datoCMSIdSchema.describe('The ID of the item type'),
  fieldId: datoCMSIdSchema.describe('The ID of the field'),
  itemId: datoCMSIdSchema.describe('The ID of the item/record'),
  uploadId: datoCMSIdSchema.describe('The ID of the upload'),
  
  // Pagination schemas
  pagination: z.object({
    offset: z.number().int().min(0).optional().describe('Zero-based offset for pagination'),
    limit: z.number().int().min(1).max(500).optional().describe('Number of results per page')
  }).optional(),
  
  // Common field schemas
  locale: z.string().describe('Locale code (e.g., "en", "it")'),
  apiKey: z.string()
    .regex(/^[a-z][a-z0-9_]*$/, 'API key must start with lowercase letter and contain only lowercase letters, numbers, and underscores')
    .describe('API key for the resource'),
};

/**
 * Type to extract the shape of a Zod object schema
 */
export type ZodShape<T extends z.ZodObject<any>> = T['shape'];

/**
 * Type to make specific fields optional in a Zod schema
 */
export type PartialSchema<T extends z.ZodObject<any>, K extends keyof T['shape']> = 
  z.ZodObject<Omit<T['shape'], K> & { [P in K]?: T['shape'][P] }>;

/**
 * Helper to validate and transform API responses
 */
export function validateApiResponse<T>(
  schema: z.ZodType<T>,
  response: unknown,
  context?: string
): T {
  try {
    return schema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Invalid API response${context ? ` for ${context}` : ''}: ${details}`);
    }
    throw error;
  }
}