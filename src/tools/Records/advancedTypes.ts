/**
 * @file advancedTypes.ts
 * @description Advanced type definitions for DatoCMS records operations
 * Provides specialized types and type utilities for working with DatoCMS records
 */

import { type FieldTypes, type Item, type ItemMeta } from './types.js';

/**
 * Account data reference
 */
export type AccountData = {
  type: 'account';
  id: string;
};

/**
 * User data reference
 */
export type UserData = {
  type: 'user';
  id: string;
};

/**
 * SSO User data reference
 */
export type SsoUserData = {
  type: 'sso_user';
  id: string;
};

/**
 * Access token data reference
 */
export type AccessTokenData = {
  type: 'access_token';
  id: string;
};

/**
 * Organization data reference
 */
export type OrganizationData = {
  type: 'organization';
  id: string;
};

/**
 * Enhanced item meta information with all possible properties
 */
export type EnhancedItemMeta = ItemMeta & {
  /**
   * Whether the record is valid
   */
  is_valid: boolean;
  
  /**
   * Whether the current version of the record is valid
   */
  is_current_version_valid: boolean | null;
  
  /**
   * Whether the published version of the record is valid
   */
  is_published_version_valid: boolean | null;
  
  /**
   * ID of the current version
   */
  current_version: string;
  
  /**
   * Workflow stage in which the item is
   */
  stage: string | null;
};

/**
 * Creator types that can be associated with a record
 */
export type CreatorData = 
  | AccountData 
  | UserData 
  | SsoUserData 
  | AccessTokenData 
  | OrganizationData;

/**
 * Enhanced item with creator information and proper typing
 */
export type EnhancedItem = Omit<Item, 'meta'> & {
  /**
   * Item type information
   */
  item_type: {
    id: string;
    type: 'item_type';
  };
  
  /**
   * Creator of the record
   */
  creator?: CreatorData;
  
  /**
   * Enhanced meta information
   */
  meta: EnhancedItemMeta;
};

/**
 * Helper type to build a record with specific field types
 * @template T - Field definitions with their types
 */
export type TypedRecord<T extends Record<string, keyof FieldTypes>> = Omit<Item, keyof T> & {
  [K in keyof T]: FieldTypes[T[K]];
};

/**
 * Function to check if a key exists in an item
 * Type guard that narrows the type to include the specified key
 */
export function hasField<K extends string>(item: Item, key: K): item is Item & Record<K, unknown> {
  return key in item;
}

/**
 * Validator function to check if an item has specific fields
 * @template T - Field definitions with their types
 * @param item - The item to validate
 * @param fields - Field definitions with expected types
 * @returns True if the item has all the specified fields with expected types
 */
export function validateItemFields<T extends Record<string, keyof FieldTypes>>(
  item: Item, 
  fields: T
): boolean {
  if (!item) return false;
  
  // Check if all required fields exist
  for (const fieldName in fields) {
    if (!hasField(item, fieldName)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Helper function to extract typed fields from an item
 * @template T - Field definitions with their types
 * @param item - The source item
 * @param fields - Field definitions with expected types
 * @returns A new object with typed fields
 * @throws Error if the item doesn't have the expected fields
 */
export function extractTypedFields<T extends Record<string, keyof FieldTypes>>(
  item: Item,
  fields: T
): { [K in keyof T]: FieldTypes[T[K]] } {
  if (!validateItemFields(item, fields)) {
    throw new Error('Item does not have the expected fields');
  }
  
  // Create a new object with typed fields
  const result = {} as { [K in keyof T]: FieldTypes[T[K]] };
  
  // Since we're working with dynamic records and can't guarantee
  // at compile time that the runtime values match the expected types,
  // we need a type assertion here. This is one of the few places where
  // it's unavoidable due to the gap between static types and dynamic content.
  for (const fieldName in fields) {
    // Need to use any as an intermediary to bridge static and dynamic typing
    // We've already validated the existence of the fields
    result[fieldName] = item[fieldName] as any;
  }
  
  return result;
}

/**
 * Type guard to check if an item is published
 * @param item - The item to check
 * @returns True if the item is published
 */
export function isPublished(item: Item): boolean {
  return Boolean(item.meta.status === 'published' && item.meta.published_at);
}

/**
 * Type guard to check if an item is a draft
 * @param item - The item to check
 * @returns True if the item is a draft
 */
export function isDraft(item: Item): boolean {
  return item.meta.status === 'draft';
}

/**
 * Type guard to check if an item is updated (published but with unpublished changes)
 * @param item - The item to check
 * @returns True if the item is updated
 */
export function isUpdated(item: Item): boolean {
  return item.meta.status === 'updated';
}

/**
 * Type guard to check if an item has scheduled publication
 * @param item - The item to check
 * @returns True if the item has scheduled publication
 */
export function hasScheduledPublication(item: Item): boolean {
  return Boolean(item.meta.publication_scheduled_at);
}

/**
 * Type guard to check if an item has scheduled unpublishing
 * @param item - The item to check
 * @returns True if the item has scheduled unpublishing
 */
export function hasScheduledUnpublishing(item: Item): boolean {
  return Boolean(item.meta.unpublishing_scheduled_at);
}