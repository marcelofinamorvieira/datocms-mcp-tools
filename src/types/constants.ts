/**
 * Type-safe constants using const assertions
 * Single source of truth for literal values throughout the codebase
 */

// Field types as defined by DatoCMS API
export const FIELD_TYPES = [
  'boolean',
  'color',
  'date',
  'date_time',
  'file',
  'float',
  'gallery',
  'integer',
  'json',
  'lat_lon',
  'link',
  'links',
  'rich_text',
  'seo',
  'slug',
  'string',
  'structured_text',
  'text',
  'video'
] as const;

export type FieldType = typeof FIELD_TYPES[number];

// Field appearances by type
export const FIELD_APPEARANCES = {
  boolean: ['switch', 'radio_buttons'] as const,
  color: ['color_picker', 'color_list'] as const,
  date: ['date_picker'] as const,
  date_time: ['date_time_picker'] as const,
  file: ['file', 'file_gallery'] as const,
  float: ['float'] as const,
  gallery: ['gallery'] as const,
  integer: ['integer'] as const,
  json: ['json', 'code'] as const,
  lat_lon: ['map'] as const,
  link: ['select', 'radio_buttons'] as const,
  links: ['select', 'checkbox_list', 'tree_select'] as const,
  rich_text: ['rich_text'] as const,
  seo: ['seo'] as const,
  slug: ['slug'] as const,
  string: ['single_line', 'simple_markdown', 'color_picker', 'star_rating'] as const,
  structured_text: ['structured_text', 'structured_text_with_blocks'] as const,
  text: ['wysiwyg', 'textarea', 'markdown'] as const,
  video: ['video'] as const
} as const;

export type FieldAppearanceMap = typeof FIELD_APPEARANCES;
export type FieldAppearance<T extends FieldType> = T extends keyof FieldAppearanceMap
  ? FieldAppearanceMap[T][number]
  : never;

// HTTP methods
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
export type HttpMethod = typeof HTTP_METHODS[number];

// Entity types in DatoCMS
export const ENTITY_TYPES = [
  'item',
  'item_type',
  'field',
  'fieldset',
  'upload',
  'role',
  'access_token',
  'webhook',
  'webhook_call',
  'build_trigger',
  'environment',
  'menu_item',
  'schema_menu_item',
  'plugin',
  'user',
  'invitation',
  'upload_collection',
  'model_filter',
  'uploads_filter'
] as const;

export type EntityType = typeof ENTITY_TYPES[number];

// Action types for handlers
export const ACTION_TYPES = [
  'create',
  'read',
  'update',
  'delete',
  'list',
  'duplicate',
  'publish',
  'unpublish',
  'validate'
] as const;

export type ActionType = typeof ACTION_TYPES[number];

// Webhook event types
export const WEBHOOK_EVENTS = [
  'item:create',
  'item:update',
  'item:delete',
  'item:publish',
  'item:unpublish',
  'item_type:create',
  'item_type:update',
  'item_type:delete',
  'upload:create',
  'upload:update',
  'upload:delete'
] as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[number];

// Build trigger types
export const BUILD_TRIGGER_TYPES = [
  'on_demand',
  'scheduled',
  'on_publish'
] as const;

export type BuildTriggerType = typeof BUILD_TRIGGER_TYPES[number];

// Sortable fields for different resources
export const RECORD_SORTABLE_FIELDS = [
  'created_at',
  'updated_at',
  'position',
  'published_at',
  'publication_scheduled_at',
  'unpublishing_scheduled_at',
  'first_published_at'
] as const;

export type RecordSortableField = typeof RECORD_SORTABLE_FIELDS[number];

export const UPLOAD_SORTABLE_FIELDS = [
  'created_at',
  'updated_at',
  'size',
  'filename',
  'basename'
] as const;

export type UploadSortableField = typeof UPLOAD_SORTABLE_FIELDS[number];

// Locales - common language/country combinations
export const LANGUAGE_CODES = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ru', 'ar',
  'nl', 'pl', 'sv', 'da', 'no', 'fi', 'cs', 'hu', 'ro', 'tr'
] as const;

export type LanguageCode = typeof LANGUAGE_CODES[number];

export const COUNTRY_CODES = [
  'US', 'GB', 'ES', 'FR', 'DE', 'IT', 'BR', 'JP', 'CN', 'RU',
  'CA', 'AU', 'MX', 'AR', 'CL', 'CO', 'PE', 'VE', 'NL', 'BE'
] as const;

export type CountryCode = typeof COUNTRY_CODES[number];

// Permission scopes
export const PERMISSION_SCOPES = [
  'all',
  'create',
  'read',
  'update',
  'delete',
  'publish',
  'unpublish',
  'destroy',
  'take_over'
] as const;

export type PermissionScope = typeof PERMISSION_SCOPES[number];

// Validation functions derived from constants
export function isValidFieldType(type: unknown): type is FieldType {
  return FIELD_TYPES.includes(type as FieldType);
}

export function isValidEntityType(type: unknown): type is EntityType {
  return ENTITY_TYPES.includes(type as EntityType);
}

export function isValidWebhookEvent(event: unknown): event is WebhookEvent {
  return WEBHOOK_EVENTS.includes(event as WebhookEvent);
}

export function isValidHttpMethod(method: unknown): method is HttpMethod {
  return HTTP_METHODS.includes(method as HttpMethod);
}

export function getFieldAppearances<T extends FieldType>(fieldType: T): readonly FieldAppearance<T>[] {
  const appearances = FIELD_APPEARANCES[fieldType as keyof typeof FIELD_APPEARANCES];
  return (appearances ?? []) as any;
}

export function isValidFieldAppearance<T extends FieldType>(
  fieldType: T,
  appearance: string
): appearance is FieldAppearance<T> {
  const validAppearances = getFieldAppearances(fieldType);
  return validAppearances.includes(appearance as FieldAppearance<T>);
}

// Type-safe enum creator
export function createEnum<T extends readonly string[]>(values: T): { [K in T[number]]: K } {
  return values.reduce((acc, val) => {
    (acc as any)[val] = val;
    return acc;
  }, {} as { [K in T[number]]: K });
}

// Create enum objects for easier usage
export const FieldTypeEnum = createEnum(FIELD_TYPES);
export const EntityTypeEnum = createEnum(ENTITY_TYPES);
export const ActionTypeEnum = createEnum(ACTION_TYPES);
export const WebhookEventEnum = createEnum(WEBHOOK_EVENTS);
export const HttpMethodEnum = createEnum(HTTP_METHODS);

// Helper to get all values of a const array as a type
export type ValueOf<T> = T[keyof T];

// Helper to create a record type from const array
export type ConstRecord<T extends readonly string[], V> = Record<T[number], V>;