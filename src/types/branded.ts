/**
 * Branded types for DatoCMS IDs
 * These types prevent accidental ID misuse at compile time
 * 
 * Example:
 * - Cannot pass a RoleId where ItemTypeId is expected
 * - Catches ID mix-ups at compile time instead of runtime
 */

import { z } from 'zod';

// Core brand type - adds phantom type to base type
type Brand<K, T> = K & { __brand: T };

// Entity ID types
export type ItemTypeId = Brand<string, 'ItemTypeId'>;
export type FieldId = Brand<string, 'FieldId'>;
export type FieldsetId = Brand<string, 'FieldsetId'>;
export type RecordId = Brand<string, 'RecordId'>;
export type UploadId = Brand<string, 'UploadId'>;
export type RoleId = Brand<string, 'RoleId'>;
export type UserId = Brand<string, 'UserId'>;
export type AccessTokenId = Brand<string, 'AccessTokenId'>;
export type InvitationId = Brand<string, 'InvitationId'>;
export type WebhookId = Brand<string, 'WebhookId'>;
export type WebhookCallId = Brand<string, 'WebhookCallId'>;
export type BuildTriggerId = Brand<string, 'BuildTriggerId'>;
export type EnvironmentId = Brand<string, 'EnvironmentId'>;
export type MenuItemId = Brand<string, 'MenuItemId'>;
export type SchemaMenuItemId = Brand<string, 'SchemaMenuItemId'>;
export type PluginId = Brand<string, 'PluginId'>;
export type UploadCollectionId = Brand<string, 'UploadCollectionId'>;
export type ModelFilterId = Brand<string, 'ModelFilterId'>;
export type UploadsFilterId = Brand<string, 'UploadsFilterId'>;
export type JobResultId = Brand<string, 'JobResultId'>;
export type DeployEventId = Brand<string, 'DeployEventId'>;

// Constructor functions with validation
export function toItemTypeId(id: string): ItemTypeId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid ItemType ID: ${id}`);
  }
  return id as ItemTypeId;
}

export function toFieldId(id: string): FieldId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid Field ID: ${id}`);
  }
  return id as FieldId;
}

export function toFieldsetId(id: string): FieldsetId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid Fieldset ID: ${id}`);
  }
  return id as FieldsetId;
}

export function toRecordId(id: string): RecordId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid Record ID: ${id}`);
  }
  return id as RecordId;
}

export function toUploadId(id: string): UploadId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid Upload ID: ${id}`);
  }
  return id as UploadId;
}

export function toRoleId(id: string): RoleId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid Role ID: ${id}`);
  }
  return id as RoleId;
}

export function toUserId(id: string): UserId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid User ID: ${id}`);
  }
  return id as UserId;
}

export function toAccessTokenId(id: string): AccessTokenId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid AccessToken ID: ${id}`);
  }
  return id as AccessTokenId;
}

export function toInvitationId(id: string): InvitationId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid Invitation ID: ${id}`);
  }
  return id as InvitationId;
}

export function toWebhookId(id: string): WebhookId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid Webhook ID: ${id}`);
  }
  return id as WebhookId;
}

export function toWebhookCallId(id: string): WebhookCallId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid WebhookCall ID: ${id}`);
  }
  return id as WebhookCallId;
}

export function toBuildTriggerId(id: string): BuildTriggerId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid BuildTrigger ID: ${id}`);
  }
  return id as BuildTriggerId;
}

export function toEnvironmentId(id: string): EnvironmentId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid Environment ID: ${id}`);
  }
  return id as EnvironmentId;
}

export function toMenuItemId(id: string): MenuItemId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid MenuItem ID: ${id}`);
  }
  return id as MenuItemId;
}

export function toSchemaMenuItemId(id: string): SchemaMenuItemId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid SchemaMenuItem ID: ${id}`);
  }
  return id as SchemaMenuItemId;
}

export function toPluginId(id: string): PluginId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid Plugin ID: ${id}`);
  }
  return id as PluginId;
}

export function toUploadCollectionId(id: string): UploadCollectionId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid UploadCollection ID: ${id}`);
  }
  return id as UploadCollectionId;
}

export function toModelFilterId(id: string): ModelFilterId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid ModelFilter ID: ${id}`);
  }
  return id as ModelFilterId;
}

export function toUploadsFilterId(id: string): UploadsFilterId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid UploadsFilter ID: ${id}`);
  }
  return id as UploadsFilterId;
}

export function toJobResultId(id: string): JobResultId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid JobResult ID: ${id}`);
  }
  return id as JobResultId;
}

export function toDeployEventId(id: string): DeployEventId {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error(`Invalid DeployEvent ID: ${id}`);
  }
  return id as DeployEventId;
}

// Type guards
export function isItemTypeId(value: unknown): value is ItemTypeId {
  return typeof value === 'string' && value.length > 0;
}

export function isFieldId(value: unknown): value is FieldId {
  return typeof value === 'string' && value.length > 0;
}

export function isFieldsetId(value: unknown): value is FieldsetId {
  return typeof value === 'string' && value.length > 0;
}

export function isRecordId(value: unknown): value is RecordId {
  return typeof value === 'string' && value.length > 0;
}

export function isUploadId(value: unknown): value is UploadId {
  return typeof value === 'string' && value.length > 0;
}

export function isRoleId(value: unknown): value is RoleId {
  return typeof value === 'string' && value.length > 0;
}

export function isUserId(value: unknown): value is UserId {
  return typeof value === 'string' && value.length > 0;
}

export function isAccessTokenId(value: unknown): value is AccessTokenId {
  return typeof value === 'string' && value.length > 0;
}

export function isInvitationId(value: unknown): value is InvitationId {
  return typeof value === 'string' && value.length > 0;
}

export function isWebhookId(value: unknown): value is WebhookId {
  return typeof value === 'string' && value.length > 0;
}

export function isWebhookCallId(value: unknown): value is WebhookCallId {
  return typeof value === 'string' && value.length > 0;
}

export function isBuildTriggerId(value: unknown): value is BuildTriggerId {
  return typeof value === 'string' && value.length > 0;
}

export function isEnvironmentId(value: unknown): value is EnvironmentId {
  return typeof value === 'string' && value.length > 0;
}

export function isMenuItemId(value: unknown): value is MenuItemId {
  return typeof value === 'string' && value.length > 0;
}

export function isSchemaMenuItemId(value: unknown): value is SchemaMenuItemId {
  return typeof value === 'string' && value.length > 0;
}

export function isPluginId(value: unknown): value is PluginId {
  return typeof value === 'string' && value.length > 0;
}

export function isUploadCollectionId(value: unknown): value is UploadCollectionId {
  return typeof value === 'string' && value.length > 0;
}

export function isModelFilterId(value: unknown): value is ModelFilterId {
  return typeof value === 'string' && value.length > 0;
}

export function isUploadsFilterId(value: unknown): value is UploadsFilterId {
  return typeof value === 'string' && value.length > 0;
}

export function isJobResultId(value: unknown): value is JobResultId {
  return typeof value === 'string' && value.length > 0;
}

export function isDeployEventId(value: unknown): value is DeployEventId {
  return typeof value === 'string' && value.length > 0;
}

// Zod transformers for use in schemas
export const itemTypeIdSchema = z.string()
  .min(1, { message: 'ItemType ID is required' })
  .transform(toItemTypeId)
  .describe('The ID of the item type');

export const fieldIdSchema = z.string()
  .min(1, { message: 'Field ID is required' })
  .transform(toFieldId)
  .describe('The ID of the field');

export const fieldsetIdSchema = z.string()
  .min(1, { message: 'Fieldset ID is required' })
  .transform(toFieldsetId)
  .describe('The ID of the fieldset');

export const recordIdSchema = z.string()
  .min(1, { message: 'Record ID is required' })
  .transform(toRecordId)
  .describe('The ID of the record');

export const uploadIdSchema = z.string()
  .min(1, { message: 'Upload ID is required' })
  .transform(toUploadId)
  .describe('The ID of the upload');

export const roleIdSchema = z.string()
  .min(1, { message: 'Role ID is required' })
  .transform(toRoleId)
  .describe('The ID of the role');

export const userIdSchema = z.string()
  .min(1, { message: 'User ID is required' })
  .transform(toUserId)
  .describe('The ID of the user');

export const accessTokenIdSchema = z.string()
  .min(1, { message: 'AccessToken ID is required' })
  .transform(toAccessTokenId)
  .describe('The ID of the access token');

export const invitationIdSchema = z.string()
  .min(1, { message: 'Invitation ID is required' })
  .transform(toInvitationId)
  .describe('The ID of the invitation');

export const webhookIdSchema = z.string()
  .min(1, { message: 'Webhook ID is required' })
  .transform(toWebhookId)
  .describe('The ID of the webhook');

export const webhookCallIdSchema = z.string()
  .min(1, { message: 'WebhookCall ID is required' })
  .transform(toWebhookCallId)
  .describe('The ID of the webhook call');

export const buildTriggerIdSchema = z.string()
  .min(1, { message: 'BuildTrigger ID is required' })
  .transform(toBuildTriggerId)
  .describe('The ID of the build trigger');

export const environmentIdSchema = z.string()
  .min(1, { message: 'Environment ID is required' })
  .transform(toEnvironmentId)
  .describe('The ID of the environment');

export const menuItemIdSchema = z.string()
  .min(1, { message: 'MenuItem ID is required' })
  .transform(toMenuItemId)
  .describe('The ID of the menu item');

export const schemaMenuItemIdSchema = z.string()
  .min(1, { message: 'SchemaMenuItem ID is required' })
  .transform(toSchemaMenuItemId)
  .describe('The ID of the schema menu item');

export const pluginIdSchema = z.string()
  .min(1, { message: 'Plugin ID is required' })
  .transform(toPluginId)
  .describe('The ID of the plugin');

export const uploadCollectionIdSchema = z.string()
  .min(1, { message: 'UploadCollection ID is required' })
  .transform(toUploadCollectionId)
  .describe('The ID of the upload collection');

export const modelFilterIdSchema = z.string()
  .min(1, { message: 'ModelFilter ID is required' })
  .transform(toModelFilterId)
  .describe('The ID of the model filter');

export const uploadsFilterIdSchema = z.string()
  .min(1, { message: 'UploadsFilter ID is required' })
  .transform(toUploadsFilterId)
  .describe('The ID of the uploads filter');

export const jobResultIdSchema = z.string()
  .min(1, { message: 'JobResult ID is required' })
  .transform(toJobResultId)
  .describe('The ID of the job result');

export const deployEventIdSchema = z.string()
  .min(1, { message: 'DeployEvent ID is required' })
  .transform(toDeployEventId)
  .describe('The ID of the deploy event');

// Helper to create ID schema with custom description
export function createBrandedIdSchema<T>(
  transformer: (id: string) => T,
  entityName: string,
  customDescription?: string
) {
  const description = customDescription || `The ID of the ${entityName}`;
  return z.string()
    .min(1, { message: `${entityName} ID is required` })
    .transform(transformer)
    .describe(description);
}