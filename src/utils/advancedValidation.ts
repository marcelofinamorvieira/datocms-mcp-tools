/**
 * @file advancedValidation.ts
 * @description Advanced validation utilities using Zod schemas
 * @module utils
 *
 * Provides complex validation patterns for the DatoCMS MCP server.
 */

import { z } from "zod";


/**
 * Types of conditions for conditional validation
 */
export type Condition<T> = (data: T) => boolean;

/**
 * Type for conditional validation function
 */
export type ConditionalValidator<T> = (condition: Condition<T>, schema: z.ZodType) => z.ZodEffects<z.ZodType<T>, T, T>;

/**
 * Options for relationship validations
 */
export interface RelationshipValidationOptions {
  message?: string;
  path?: string;
}

/**
 * Apply a validator only if a condition is met
 * 
 * @param schema The base schema to extend
 * @param condition Function that determines if validation should be applied
 * @param thenSchema Schema to apply when condition is true
 * @param elseSchema Optional schema to apply when condition is false
 * @returns Zod schema with conditional validation
 */
export function conditional<T>(
  schema: z.ZodType<T>,
  condition: Condition<T>,
  thenSchema: z.ZodType,
  elseSchema?: z.ZodType
): z.ZodEffects<z.ZodType<T>, T, T> {
  return schema.superRefine((data, ctx) => {
    if (condition(data)) {
      try {
        const result = thenSchema.safeParse(data);
        if (!result.success) {
          result.error.issues.forEach(issue => ctx.addIssue(issue));
        }
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Conditional validation failed",
        });
      }
    } else if (elseSchema) {
      try {
        const result = elseSchema.safeParse(data);
        if (!result.success) {
          result.error.issues.forEach(issue => ctx.addIssue(issue));
        }
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Conditional validation failed",
        });
      }
    }
  });
}

/**
 * Validate a dependent relationship between fields
 * Ensures if one field is present, another field is also present
 * 
 * @param schema The base schema to extend
 * @param field The field that triggers the requirement
 * @param dependentField The field that becomes required
 * @param options Configuration options
 * @returns Zod schema with dependent field validation
 */
export function requireDependentField<T extends Record<string, any>>(
  schema: z.ZodType<T>,
  field: keyof T,
  dependentField: keyof T,
  options: RelationshipValidationOptions = {}
): z.ZodEffects<z.ZodType<T>, T, T> {
  const message = options.message || `Field "${String(dependentField)}" is required when "${String(field)}" is provided`;
  
  return schema.superRefine((data, ctx) => {
    if (data[field] !== undefined && data[field] !== null && (data[dependentField] === undefined || data[dependentField] === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: options.path ? [options.path] : [String(dependentField)]
      });
    }
  });
}

/**
 * Validate mutual exclusivity between fields
 * Ensures only one of the specified fields is present
 * 
 * @param schema The base schema to extend
 * @param fields Array of field names that should be mutually exclusive
 * @param options Configuration options
 * @returns Zod schema with mutual exclusivity validation
 */
export function mutuallyExclusive<T extends Record<string, any>>(
  schema: z.ZodType<T>,
  fields: Array<keyof T>,
  options: RelationshipValidationOptions = {}
): z.ZodEffects<z.ZodType<T>, T, T> {
  const message = options.message || `Only one of the following fields should be provided: ${fields.join(', ')}`;
  
  return schema.superRefine((data, ctx) => {
    const presentFields = fields.filter(field => 
      data[field] !== undefined && data[field] !== null
    );
    
    if (presentFields.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: options.path ? [options.path] : []
      });
    }
  });
}

/**
 * Validate mutual inclusivity between fields
 * Ensures either all specified fields are present or none are
 * 
 * @param schema The base schema to extend
 * @param fields Array of field names that should be mutually inclusive
 * @param options Configuration options
 * @returns Zod schema with mutual inclusivity validation
 */
export function mutuallyInclusive<T extends Record<string, any>>(
  schema: z.ZodType<T>,
  fields: Array<keyof T>,
  options: RelationshipValidationOptions = {}
): z.ZodEffects<z.ZodType<T>, T, T> {
  const message = options.message || `Either all or none of these fields should be provided: ${fields.join(', ')}`;
  
  return schema.superRefine((data, ctx) => {
    const presentFields = fields.filter(field => 
      data[field] !== undefined && data[field] !== null
    );
    
    if (presentFields.length > 0 && presentFields.length < fields.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: options.path ? [options.path] : []
      });
    }
  });
}

/**
 * Validate that at least one of the specified fields is present
 * 
 * @param schema The base schema to extend
 * @param fields Array of field names where at least one should be present
 * @param options Configuration options
 * @returns Zod schema with at-least-one validation
 */
export function atLeastOne<T extends Record<string, any>>(
  schema: z.ZodType<T>,
  fields: Array<keyof T>,
  options: RelationshipValidationOptions = {}
): z.ZodEffects<z.ZodType<T>, T, T> {
  const message = options.message || `At least one of these fields is required: ${fields.join(', ')}`;
  
  return schema.superRefine((data, ctx) => {
    const presentFields = fields.filter(field => 
      data[field] !== undefined && data[field] !== null
    );
    
    if (presentFields.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: options.path ? [options.path] : []
      });
    }
  });
}

/**
 * Validate that a property value exists in an allowed set determined by another field
 * 
 * @param schema The base schema to extend
 * @param field The field to validate
 * @param dependentField The field that determines allowed values
 * @param allowedValuesFn Function that returns allowed values based on dependent field
 * @param options Configuration options
 * @returns Zod schema with dependent value validation
 */
export function dependentValues<T extends Record<string, any>, K extends keyof T, D extends keyof T>(
  schema: z.ZodType<T>,
  field: K,
  dependentField: D,
  allowedValuesFn: (dependentValue: T[D]) => Array<T[K]>,
  options: RelationshipValidationOptions = {}
): z.ZodEffects<z.ZodType<T>, T, T> {
  return schema.superRefine((data, ctx) => {
    if (data[dependentField] !== undefined && data[field] !== undefined) {
      const allowedValues = allowedValuesFn(data[dependentField]);
      
      if (!allowedValues.includes(data[field])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: options.message || `Invalid value for "${String(field)}" based on "${String(dependentField)}". Allowed values: ${allowedValues.join(', ')}`,
          path: options.path ? [options.path] : [String(field)]
        });
      }
    }
  });
}

/**
 * Transform a field to a validated version based on other fields
 * 
 * @param schema The base schema to extend
 * @param transformFn Function that transforms the data
 * @returns Zod schema with transformation applied
 */
export function transformDependentField<T extends Record<string, any>, U>(
  schema: z.ZodType<T>,
  transformFn: (data: T) => U
): z.ZodEffects<z.ZodType<T>, U, T> {
  return schema.transform(transformFn);
}

export default {
  conditional,
  requireDependentField,
  mutuallyExclusive,
  mutuallyInclusive,
  atLeastOne,
  dependentValues,
  transformDependentField
};