/**
 * Template literal types for type-safe string patterns
 * Provides compile-time validation for string formats
 */

import { 
  RecordSortableField, 
  UploadSortableField,
  EntityType,
  LanguageCode,
  CountryCode
} from './constants.js';

// Sorting patterns
export type SortDirection = 'ASC' | 'DESC';

// Generic sorting for any field
export type OrderBy<T extends string> = `${T}_${SortDirection}`;

// Specific sorting patterns for different resources
export type RecordOrderBy = OrderBy<RecordSortableField>;
export type UploadOrderBy = OrderBy<UploadSortableField>;

// Generic sorting with custom fields
export type CustomOrderBy<T extends string> = OrderBy<T | RecordSortableField>;

// API key patterns (snake_case)
export type ApiKey = `${Lowercase<string>}_${Lowercase<string>}`;
export type ExtendedApiKey = `${Lowercase<string>}_${Lowercase<string>}_${Lowercase<string>}`;

// Locale patterns
export type LocaleCode = `${LanguageCode}` | `${LanguageCode}-${CountryCode}`;
export type LocaleWithScript = `${LanguageCode}-${Uppercase<string>}-${CountryCode}`;

// Field API key patterns
export type FieldApiKey = Lowercase<string>;
export type NestedFieldPath = `${string}.${string}`;
export type DeepFieldPath = `${string}.${string}.${string}`;

// Modular content block patterns
export type ModularBlockApiKey = `${Lowercase<string>}_block`;
export type ModularSectionApiKey = `${Lowercase<string>}_section`;
export type ModularComponentApiKey = `${Lowercase<string>}_component`;

// Webhook event patterns
export type WebhookEntityType = 'item' | 'item_type' | 'upload' | 'asset';
export type WebhookEventType = 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
export type WebhookEventPattern = `${WebhookEntityType}:${WebhookEventType}`;

// Environment name patterns
export type EnvironmentName = 'main' | `${string}-sandbox` | `feature-${string}` | `release-${string}`;
export type EnvironmentBranch = `branch-${string}`;

// Permission patterns
export type PermissionResource = EntityType;
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'publish' | 'destroy';
export type Permission = `${PermissionResource}:${PermissionAction}`;
export type WildcardPermission = `${PermissionResource}:*` | '*:*';

// URL patterns
export type HttpProtocol = 'http' | 'https';
export type WebhookUrl = `${HttpProtocol}://${string}`;
export type AssetUrl = `https://${string}.mux.com/${string}` | `https://www.datocms-assets.com/${string}`;

// Filter patterns
export type FilterOperator = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'nin' | 'exists' | 'contains';
export type FilterExpression<T extends string> = `${T}[${FilterOperator}]`;

// Date patterns
export type ISODate = `${number}-${number}-${number}`;
export type ISODateTime = `${ISODate}T${number}:${number}:${number}${string}`;

// Version patterns
export type SemanticVersion = `${number}.${number}.${number}`;
export type PreReleaseVersion = `${SemanticVersion}-${string}`;

// Plugin parameter patterns
export type PluginParameterKey = `${Lowercase<string>}_${Lowercase<string>}`;
export type PluginFieldExtension = `${string}::${string}`;

// Build trigger patterns
export type BuildTriggerName = `${string}_build` | `deploy_${string}`;
export type CronExpression = `${string} ${string} ${string} ${string} ${string}`;

// Validation functions for template literal types
export function isValidOrderBy<T extends string>(
  value: string,
  validFields: readonly T[]
): value is OrderBy<T> {
  const pattern = /^(.+)_(ASC|DESC)$/;
  const match = value.match(pattern);
  if (!match) return false;
  
  const [, field, direction] = match;
  return validFields.includes(field as T) && ['ASC', 'DESC'].includes(direction!);
}

export function isValidApiKey(value: string): value is ApiKey {
  return /^[a-z]+(_[a-z]+)+$/.test(value);
}

export function isValidLocaleCode(value: string): value is LocaleCode {
  // Simple locale (e.g., 'en')
  if (/^[a-z]{2}$/.test(value)) return true;
  // Locale with country (e.g., 'en-US')
  return /^[a-z]{2}-[A-Z]{2}$/.test(value);
}

export function isValidWebhookUrl(value: string): value is WebhookUrl {
  return /^https?:\/\/.+/.test(value);
}

export function isValidWebhookEvent(value: string): value is WebhookEventPattern {
  return /^(item|item_type|upload|asset):(create|update|delete|publish|unpublish)$/.test(value);
}

export function isValidEnvironmentName(value: string): value is EnvironmentName {
  return (
    value === 'main' ||
    value.endsWith('-sandbox') ||
    value.startsWith('feature-') ||
    value.startsWith('release-') ||
    value.startsWith('branch-')
  );
}

export function isValidPermission(value: string): value is Permission | WildcardPermission {
  return /^(\*|[a-z_]+):(\*|create|read|update|delete|publish|destroy)$/.test(value);
}

export function isValidFilterExpression(value: string): value is FilterExpression<string> {
  return /^[a-zA-Z_]+\[(eq|neq|lt|lte|gt|gte|in|nin|exists|contains)\]$/.test(value);
}

export function isValidISODate(value: string): value is ISODate {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidISODateTime(value: string): value is ISODateTime {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}

export function isValidSemanticVersion(value: string): value is SemanticVersion | PreReleaseVersion {
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(value);
}

export function isValidCronExpression(value: string): value is CronExpression {
  // Basic cron validation (5 fields)
  const fields = value.split(' ');
  return fields.length === 5;
}

// Helper functions to construct template literal types
export function createOrderBy<T extends string>(field: T, direction: SortDirection): OrderBy<T> {
  return `${field}_${direction}` as OrderBy<T>;
}

export function createFilterExpression<T extends string>(field: T, operator: FilterOperator): FilterExpression<T> {
  return `${field}[${operator}]` as FilterExpression<T>;
}

export function createWebhookEvent(entity: WebhookEntityType, event: WebhookEventType): WebhookEventPattern {
  return `${entity}:${event}`;
}

export function createPermission(resource: PermissionResource, action: PermissionAction): Permission {
  return `${resource}:${action}`;
}

export function createLocaleCode(language: LanguageCode, country?: CountryCode): LocaleCode {
  return country ? `${language}-${country}` : language;
}

// Type helpers for extracting parts of template literals
export type ExtractField<T> = T extends `${infer Field}_${SortDirection}` ? Field : never;
export type ExtractDirection<T> = T extends `${string}_${infer Dir}` ? Dir : never;
export type ExtractEntity<T> = T extends `${infer Entity}:${string}` ? Entity : never;
export type ExtractEvent<T> = T extends `${string}:${infer Event}` ? Event : never;

// Examples of usage
export type RecordSortExample = 'created_at_DESC' | 'position_ASC';
export type LocaleExample = 'en' | 'en-US' | 'pt-BR';
export type WebhookExample = 'item:create' | 'upload:delete';
export type PermissionExample = 'item_type:create' | 'upload:read' | '*:*';