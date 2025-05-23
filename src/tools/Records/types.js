/**
 * @file types.ts
 * @description Type definitions for DatoCMS records operations
 * Imports types from the DatoCMS CMA client and defines additional types for the MCP server
 */
/**
 * Type guard to check if an error is a DatoCMS API error
 */
export function isDatoCMSApiError(error) {
    return (typeof error === 'object' &&
        error !== null &&
        (('status' in error && typeof error.status === 'number') ||
            ('code' in error && typeof error.code === 'string') ||
            ('errors' in error && Array.isArray(error.errors)) ||
            ('data' in error && typeof error.data === 'object' && error.data !== null && 'errors' in error.data)));
}
/**
 * Type guard for validation errors
 */
export function isValidationError(error) {
    return (isDatoCMSApiError(error) &&
        (error.code === 'VALIDATION_ERROR' || error.status === 422));
}
/**
 * Type guard for version conflict errors
 */
export function isVersionConflictError(error) {
    return (isDatoCMSApiError(error) &&
        error.code === 'STALE_ITEM_VERSION');
}
/**
 * Type guard for not found errors
 */
export function isNotFoundError(error) {
    return (isDatoCMSApiError(error) &&
        (error.code === 'RECORD_NOT_FOUND' || error.status === 404));
}
/**
 * Type guard for authorization errors
 */
export function isAuthorizationError(error) {
    return (isDatoCMSApiError(error) &&
        (error.code === 'UNAUTHORIZED' || error.status === 401));
}
