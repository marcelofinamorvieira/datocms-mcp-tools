/**
 * Type guard functions for runtime type checking
 * These guards provide type-safe ways to check DatoCMS data structures
 */

import type { FieldAppearance, DatoCMSError, DatoCMSErrorResponse } from './index.js';

/**
 * Check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if a value is a valid DatoCMS ID (base64 UUID format)
 */
export function isDatoCMSId(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value);
}

/**
 * Validator type guards
 */
export function hasEnumValidator(
  validators: unknown
): validators is { enum: { values: string[] } } & Record<string, unknown> {
  return (
    isObject(validators) &&
    'enum' in validators &&
    isObject(validators.enum) &&
    'values' in validators.enum &&
    Array.isArray(validators.enum.values) &&
    validators.enum.values.every((v: unknown) => typeof v === 'string')
  );
}

export function hasLengthValidator(
  validators: unknown
): validators is { length: { min?: number; max?: number } } & Record<string, unknown> {
  return (
    isObject(validators) &&
    'length' in validators &&
    isObject(validators.length) &&
    (validators.length.min === undefined || typeof validators.length.min === 'number') &&
    (validators.length.max === undefined || typeof validators.length.max === 'number')
  );
}

export function hasRequiredValidator(
  validators: unknown
): validators is { required: Record<string, never> } & Record<string, unknown> {
  return (
    isObject(validators) &&
    'required' in validators &&
    isObject(validators.required) &&
    Object.keys(validators.required).length === 0
  );
}

export function hasUniqueValidator(
  validators: unknown
): validators is { unique: Record<string, never> } & Record<string, unknown> {
  return (
    isObject(validators) &&
    'unique' in validators &&
    isObject(validators.unique) &&
    Object.keys(validators.unique).length === 0
  );
}

export function hasFormatValidator(
  validators: unknown
): validators is { format: { predefined_pattern?: string; custom_pattern?: string } } & Record<string, unknown> {
  return (
    isObject(validators) &&
    'format' in validators &&
    isObject(validators.format)
  );
}

export function hasNumberRangeValidator(
  validators: unknown
): validators is { number_range: { min?: number; max?: number } } & Record<string, unknown> {
  return (
    isObject(validators) &&
    'number_range' in validators &&
    isObject(validators.number_range)
  );
}

/**
 * Field appearance type guards
 */
export function isSingleLineAppearance(
  appearance: unknown
): appearance is FieldAppearance & { editor: 'single_line' } {
  return (
    isObject(appearance) &&
    'editor' in appearance &&
    appearance.editor === 'single_line'
  );
}

export function isTextareaAppearance(
  appearance: unknown
): appearance is FieldAppearance & { editor: 'textarea' } {
  return (
    isObject(appearance) &&
    'editor' in appearance &&
    appearance.editor === 'textarea'
  );
}

export function isWysiwygAppearance(
  appearance: unknown
): appearance is FieldAppearance & { editor: 'wysiwyg' } {
  return (
    isObject(appearance) &&
    'editor' in appearance &&
    appearance.editor === 'wysiwyg'
  );
}

export function hasAppearanceParameters(
  appearance: unknown
): appearance is { parameters: Record<string, unknown> } {
  return (
    isObject(appearance) &&
    'parameters' in appearance &&
    isObject(appearance.parameters)
  );
}

/**
 * Field type guards
 */
export function isStringFieldType(fieldType: unknown): fieldType is 'string' {
  return fieldType === 'string';
}

export function isTextField(fieldType: unknown): fieldType is 'text' {
  return fieldType === 'text';
}

export function isNumberField(fieldType: unknown): fieldType is 'integer' | 'float' {
  return fieldType === 'integer' || fieldType === 'float';
}

export function isMediaField(fieldType: unknown): fieldType is 'file' | 'gallery' {
  return fieldType === 'file' || fieldType === 'gallery';
}

export function isRelationshipField(fieldType: unknown): fieldType is 'link' | 'links' {
  return fieldType === 'link' || fieldType === 'links';
}

/**
 * Error type guards
 */
export function isDatoCMSError(error: unknown): error is DatoCMSError {
  return (
    isObject(error) &&
    'id' in error &&
    'status' in error &&
    'code' in error &&
    'title' in error &&
    'detail' in error &&
    typeof error.id === 'string' &&
    typeof error.status === 'string' &&
    typeof error.code === 'string' &&
    typeof error.title === 'string' &&
    typeof error.detail === 'string'
  );
}

export function isDatoCMSErrorResponse(response: unknown): response is DatoCMSErrorResponse {
  return (
    isObject(response) &&
    'errors' in response &&
    Array.isArray(response.errors) &&
    response.errors.every(isDatoCMSError)
  );
}

/**
 * Response type guards
 */
export function hasData<T>(response: unknown): response is { data: T } {
  return isObject(response) && 'data' in response;
}

export function hasMeta(response: unknown): response is { meta: Record<string, unknown> } {
  return isObject(response) && 'meta' in response && isObject(response.meta);
}

export function isCollectionResponse<T>(
  response: unknown
): response is { data: T[]; meta: { total_count: number } } {
  return (
    hasData(response) &&
    Array.isArray(response.data) &&
    hasMeta(response) &&
    'total_count' in response.meta &&
    typeof response.meta.total_count === 'number'
  );
}

/**
 * Nullable field helper
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Safe property access with type narrowing
 */
export function hasProperty<K extends string, T>(
  obj: unknown,
  key: K
): obj is Record<K, T> {
  return isObject(obj) && key in obj;
}

/**
 * Type guard for checking if a value is a specific string literal
 */
export function isStringLiteral<T extends string>(
  value: unknown,
  literal: T
): value is T {
  return value === literal;
}

/**
 * Type guard for checking if a value is one of several string literals
 */
export function isOneOf<T extends readonly string[]>(
  value: unknown,
  options: T
): value is T[number] {
  return typeof value === 'string' && options.includes(value);
}