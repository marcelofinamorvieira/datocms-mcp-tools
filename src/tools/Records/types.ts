/**
 * @file types.ts
 * @description Type definitions for DatoCMS records operations
 * Uses DatoCMS CMA client types directly
 */

import type { SimpleSchemaTypes, Client } from '@datocms/cma-client-node';

/**
 * Re-export types from DatoCMS CMA client for convenience
 */
export type Item = SimpleSchemaTypes.Item;
export type ItemMeta = SimpleSchemaTypes.Item['meta'];
export type ItemVersion = SimpleSchemaTypes.ItemVersion;
export type ItemIdentity = string;

/**
 * DatoCMS available statuses for records
 */
export type RecordStatus = 'draft' | 'updated' | 'published';

/**
 * Type for the basic ItemType reference when creating or updating records
 */
export type ItemTypeReference = SimpleSchemaTypes.ItemTypeData;

/**
 * Payload for creating a new record in DatoCMS
 */
export type RecordCreatePayload = SimpleSchemaTypes.ItemCreateSchema;

/**
 * Payload for updating a record in DatoCMS
 */
export type RecordUpdatePayload = SimpleSchemaTypes.ItemUpdateSchema;

/**
 * Type for localized field values
 */
export type LocalizedField<T> = {
  [locale: string]: T;
};

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
 * Type for record query parameters
 */
export type RecordQueryParams = SimpleSchemaTypes.ItemInstancesHrefSchema;

/**
 * Field localization configuration
 */
export type FieldLocalization = {
  localized: boolean;
};

/**
 * Publication schedule parameters
 */
export type PublicationSchedule = SimpleSchemaTypes.ScheduledPublicationCreateSchema;

/**
 * Unpublishing schedule parameters
 */
export type UnpublishingSchedule = SimpleSchemaTypes.ScheduledUnpublishingCreateSchema;

/**
 * Selective publish parameters
 */
export type SelectivePublish = SimpleSchemaTypes.ItemPublishSchema & { type: 'selective_publish_operation' };

/**
 * Selective unpublish parameters
 */
export type SelectiveUnpublish = SimpleSchemaTypes.ItemUnpublishSchema & { type: 'selective_unpublish_operation' };

/**
 * Reference information for items
 */
export type ItemReference = SimpleSchemaTypes.ItemData;

/**
 * Bulk operation identity for items
 */
export type BulkItemIdentity = SimpleSchemaTypes.ItemData;

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
export type DatoCmsClient = Client;