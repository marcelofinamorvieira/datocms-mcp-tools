/**
 * @file types.ts
 * @description Type definitions for DatoCMS records operations
 * Imports types from the DatoCMS CMA client and defines additional types for the MCP server
 */

// Import types from the DatoCMS CMA client
// We'll use our own type definitions to avoid dependency issues, but pattern them after the CMA client types
// This approach makes the code more resilient to changes in the CMA client

/**
 * Item type for DatoCMS records
 */
export type Item = {
  id: string;
  type: string;
  item_type: {
    id: string;
    type: string;
  };
  meta: ItemMeta;
  [key: string]: unknown;
};

/**
 * Item meta information
 */
export type ItemMeta = {
  created_at: string;
  updated_at: string;
  published_at: string | null;
  first_published_at: string | null;
  publication_scheduled_at: string | null;
  unpublishing_scheduled_at: string | null;
  status: RecordStatus | null;
  is_valid: boolean;
  is_current_version_valid: boolean | null;
  is_published_version_valid: boolean | null;
  current_version: string;
  stage: string | null;
};

/**
 * Item version information
 */
export type ItemVersion = {
  id: string;
  type: 'item_version';
  item_type: {
    id: string;
    type: string;
  };
  item: {
    id: string;
    type: string;
  };
  meta: {
    created_at: string;
    is_valid: boolean;
    is_published: boolean;
    is_current: boolean;
  };
  [key: string]: unknown;
};

/**
 * Generic identity type
 */
export type ItemIdentity = string;

/**
 * DatoCMS available statuses for records
 */
export type RecordStatus = 'draft' | 'updated' | 'published';

/**
 * Type for the basic ItemType reference when creating or updating records
 */
export type ItemTypeReference = {
  id: string;
  type: "item_type";
};

/**
 * Payload for creating a new record in DatoCMS
 */
export type RecordCreatePayload = {
  item_type: ItemTypeReference;
  [key: string]: unknown;
};

/**
 * Payload for updating a record in DatoCMS
 */
export type RecordUpdatePayload = {
  meta?: {
    current_version?: string;
  };
  [key: string]: unknown;
};

/**
 * Type for localized field values
 */
export type LocalizedField<T> = {
  [locale: string]: T;
};

/**
 * Field value types for DatoCMS records
 */

// Simple scalar types
export type StringFieldValue = string;
export type TextField = string;
export type BooleanFieldValue = boolean;
export type IntegerFieldValue = number;
export type FloatFieldValue = number;
export type DateFieldValue = string;
export type DateTimeFieldValue = string;
export type JsonFieldValue = Record<string, unknown>;

// Structured types
export interface LinkFieldValue {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
}

export type LinksFieldValue = LinkFieldValue[];

export interface FileFieldValue {
  url: string;
  width?: number;
  height?: number;
  size?: number;
  format?: string;
  alt?: string;
  title?: string;
}

export type GalleryFieldValue = FileFieldValue[];

export interface SeoFieldValue {
  title?: string;
  description?: string;
  image?: {
    url: string;
    width?: number;
    height?: number;
  };
  twitterCard?: string;
}

export interface ColorFieldValue {
  red: number;
  green: number;
  blue: number;
  alpha: number;
  hex: string;
}

export interface VideoFieldValue {
  url: string;
  provider: string;
  provider_uid: string;
  thumbnail_url: string;
  title: string;
  width: number;
  height: number;
}

export interface LatLonFieldValue {
  latitude: number;
  longitude: number;
}

// Map field names to their value types
export interface FieldTypes {
  string: StringFieldValue;
  text: TextField;
  boolean: BooleanFieldValue;
  integer: IntegerFieldValue;
  float: FloatFieldValue;
  date: DateFieldValue;
  datetime: DateTimeFieldValue;
  date_time: DateTimeFieldValue;
  json: JsonFieldValue;
  link: LinkFieldValue;
  links: LinksFieldValue;
  file: FileFieldValue;
  gallery: GalleryFieldValue;
  seo: SeoFieldValue;
  color: ColorFieldValue;
  video: VideoFieldValue;
  lat_lon: LatLonFieldValue;
  rich_text: Record<string, unknown>; // Simplified for now
}

/**
 * Helper type for extracting a specific field type
 */
export type FieldType<K extends keyof FieldTypes> = FieldTypes[K];

/**
 * Type for record fields that can be localized or not
 */
export type RecordField<T extends keyof FieldTypes = keyof FieldTypes> = FieldTypes[T] | LocalizedField<FieldTypes[T]>;

/**
 * Handler response type for consistent response formatting
 */
export type HandlerResponse<T = unknown> = {
  status: 'success' | 'error';
  data?: T;
  message?: string;
};

/**
 * MCP response object structure
 */
export type McpResponse = {
  content: Array<{
    type: "text";
    text: string;
  }>;
};

/**
 * DatoCMS API Error structure
 */
export type DatoCMSApiError = {
  code?: string;
  status?: number;
  message?: string;
  errors?: Array<unknown>;
  data?: {
    errors?: Array<unknown>;
  };
};

/**
 * DatoCMS validation error
 */
export type DatoCMSValidationError = DatoCMSApiError & {
  code: 'VALIDATION_ERROR';
  status: 422;
  errors?: Array<{
    field?: string;
    message: string;
    details?: unknown;
  }>;
};

/**
 * DatoCMS version conflict error
 */
export type DatoCMSVersionConflictError = DatoCMSApiError & {
  code: 'STALE_ITEM_VERSION';
  current_version: string;
};

/**
 * DatoCMS not found error
 */
export type DatoCMSNotFoundError = DatoCMSApiError & {
  code: 'RECORD_NOT_FOUND';
  status: 404;
};

/**
 * DatoCMS unauthorized error
 */
export type DatoCMSUnauthorizedError = DatoCMSApiError & {
  code: 'UNAUTHORIZED';
  status: 401;
};

/**
 * Type guard to check if an error is a DatoCMS API error
 */
export function isDatoCMSApiError(error: unknown): error is DatoCMSApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (('status' in error && typeof (error as DatoCMSApiError).status === 'number') ||
     ('code' in error && typeof (error as DatoCMSApiError).code === 'string') ||
     ('errors' in error && Array.isArray((error as any).errors)) ||
     ('data' in error && typeof (error as any).data === 'object' && (error as any).data !== null && 'errors' in (error as any).data))
  );
}

/**
 * Type guard for validation errors
 */
export function isValidationError(error: unknown): error is DatoCMSValidationError {
  return (
    isDatoCMSApiError(error) && 
    (error.code === 'VALIDATION_ERROR' || error.status === 422)
  );
}

/**
 * Type guard for version conflict errors
 */
export function isVersionConflictError(error: unknown): error is DatoCMSVersionConflictError {
  return (
    isDatoCMSApiError(error) && 
    error.code === 'STALE_ITEM_VERSION'
  );
}

/**
 * Type guard for not found errors
 */
export function isNotFoundError(error: unknown): error is DatoCMSNotFoundError {
  return (
    isDatoCMSApiError(error) && 
    (error.code === 'RECORD_NOT_FOUND' || error.status === 404)
  );
}

/**
 * Type guard for authorization errors
 */
export function isAuthorizationError(error: unknown): error is DatoCMSUnauthorizedError {
  return (
    isDatoCMSApiError(error) && 
    (error.code === 'UNAUTHORIZED' || error.status === 401)
  );
}

/**
 * Basic operators for filtering records
 */
export type FilterOperator = 
  | 'eq'      // equal
  | 'neq'     // not equal
  | 'gt'      // greater than
  | 'gte'     // greater than or equal
  | 'lt'      // less than
  | 'lte'     // less than or equal
  | 'in'      // in array
  | 'nin'     // not in array
  | 'contains' // contains (DatoCMS API uses 'cont', but we use 'contains' for clarity)
  | 'matches'  // matches regex pattern
  | 'cont'    // contains (alternative name for compatibility)
  | 'ncont'   // does not contain
  | 'exists'  // field exists
  | 'nexists'; // field does not exist

/**
 * Filter definition for a single field
 */
export type FieldFilter<T = unknown> = {
  [K in FilterOperator]?: T;
};

/**
 * Logical operators for combining filters
 */
export type LogicalOperator = 'and' | 'or' | 'not';

/**
 * Combined filter with logical operators
 */
export type CombinedFilter = {
  [K in LogicalOperator]?: Array<RecordFilter>;
};

/**
 * Common query parameters used in DatoCMS filter expressions
 */
export type CommonQueryParams = {
  type?: string;
  locale?: string;
  query?: string;
  ids?: string[] | string;
};

/**
 * Record filter that can be either a field filter or combined filter
 */
export type RecordFilter = (CommonQueryParams & {
  [field: string]: FieldFilter | unknown;
}) | CombinedFilter;

/**
 * Order by direction
 */
export type OrderDirection = 'asc' | 'desc';

/**
 * Order by parameter
 * Note: While our API accepts more complex structures, the client expects a string
 */
export type OrderBy = string;

/**
 * Parameters for querying records as expected by the CMA client
 */
export type RecordQueryParams = {
  version?: 'published' | 'current';
  nested?: boolean;
  filter?: RecordFilter;
  order_by?: string; // Must be string for client compatibility
  locale?: string;
  page?: {
    limit: number;
    offset: number;
  };
};

/**
 * Parameters for publishing/unpublishing records
 */
export type PublicationParams = {
  content_in_locales?: string[];
  non_localized_content?: boolean;
  recursive?: boolean;
};

/**
 * Parameters for scheduling publication/unpublication
 */
export type SchedulingParams = {
  publication_scheduled_at?: string;
  unpublishing_scheduled_at?: string;
};

/**
 * Type definition for the DatoCMS CMA Client
 */
export type DatoCmsClient = {
  items: {
    find: (id: string, params?: Record<string, unknown>) => Promise<Item>;
    all: (params?: Record<string, unknown>) => Promise<Item[]>;
    create: (data: RecordCreatePayload) => Promise<Item>;
    update: (id: string, data: RecordUpdatePayload) => Promise<Item>;
    destroy: (id: string) => Promise<void>;
    publish: (
      id: string, 
      options?: { content_in_locales?: string[], non_localized_content?: boolean },
      params?: { recursive?: boolean }
    ) => Promise<Item>;
    unpublish: (id: string, params?: { recursive?: boolean }) => Promise<Item>;
  };
  itemVersions: {
    find: (id: string) => Promise<ItemVersion>;
    all: (params: { item_id: string }) => Promise<ItemVersion[]>;
    restore: (id: string) => Promise<Item>;
  };
  // Add other client methods as needed
};