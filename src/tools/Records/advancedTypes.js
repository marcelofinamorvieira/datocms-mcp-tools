/**
 * @file advancedTypes.ts
 * @description Advanced type definitions for DatoCMS records operations
 * Provides specialized types and type utilities for working with DatoCMS records
 */
/**
 * Function to check if a key exists in an item
 * Type guard that narrows the type to include the specified key
 */
export function hasField(item, key) {
    return key in item;
}
/**
 * Validator function to check if an item has specific fields
 * @template T - Field definitions with their types
 * @param item - The item to validate
 * @param fields - Field definitions with expected types
 * @returns True if the item has all the specified fields with expected types
 */
export function validateItemFields(item, fields) {
    if (!item)
        return false;
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
export function extractTypedFields(item, fields) {
    if (!validateItemFields(item, fields)) {
        throw new Error('Item does not have the expected fields');
    }
    // Create a new object with typed fields
    const result = {};
    // Since we're working with dynamic records and can't guarantee
    // at compile time that the runtime values match the expected types,
    // we need a type assertion here. This is one of the few places where
    // it's unavoidable due to the gap between static types and dynamic content.
    for (const fieldName in fields) {
        // Need to use any as an intermediary to bridge static and dynamic typing
        // We've already validated the existence of the fields
        result[fieldName] = item[fieldName];
    }
    return result;
}
/**
 * Type guard to check if an item is published
 * @param item - The item to check
 * @returns True if the item is published
 */
export function isPublished(item) {
    return Boolean(item.meta.status === 'published' && item.meta.published_at);
}
/**
 * Type guard to check if an item is a draft
 * @param item - The item to check
 * @returns True if the item is a draft
 */
export function isDraft(item) {
    return item.meta.status === 'draft';
}
/**
 * Type guard to check if an item is updated (published but with unpublished changes)
 * @param item - The item to check
 * @returns True if the item is updated
 */
export function isUpdated(item) {
    return item.meta.status === 'updated';
}
/**
 * Type guard to check if an item has scheduled publication
 * @param item - The item to check
 * @returns True if the item has scheduled publication
 */
export function hasScheduledPublication(item) {
    return Boolean(item.meta.publication_scheduled_at);
}
/**
 * Type guard to check if an item has scheduled unpublishing
 * @param item - The item to check
 * @returns True if the item has scheduled unpublishing
 */
export function hasScheduledUnpublishing(item) {
    return Boolean(item.meta.unpublishing_scheduled_at);
}
