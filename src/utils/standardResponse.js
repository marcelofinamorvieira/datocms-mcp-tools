/**
 * @file standardResponse.ts
 * @description Standardized response format utilities for DatoCMS MCP handlers
 * @module utils
 *
 * This file provides utilities for creating standardized responses across
 * all handlers in the DatoCMS MCP server. It ensures consistent response
 * formats for success and error cases, and includes support for pagination
 * and other metadata.
 */
import { createResponse } from "./responseHandlers.js";
import { extractDetailedErrorInfo, isDatoCMSApiError } from "./errorHandlers.js";
import { isDebugEnabled, formatErrorForDebug } from "./debugUtils.js";
/**
 * Creates a standard success response
 *
 * @param data - The response data
 * @param message - Optional success message
 * @param meta - Optional additional metadata (including debug data)
 * @returns A standardized success response
 *
 * @example
 * return createStandardSuccessResponse(
 *   { id: '123', name: 'Example' },
 *   'Resource created successfully',
 *   { debug: debugData }
 * );
 */
export function createStandardSuccessResponse(data, message, meta, requestDebug) {
    const finalMeta = { ...meta };
    // Only include debug data if debug mode is enabled
    if (finalMeta.debug && !isDebugEnabled(requestDebug)) {
        delete finalMeta.debug;
    }
    return {
        success: true,
        data,
        ...(message && { message }),
        ...(Object.keys(finalMeta).length > 0 && { meta: finalMeta })
    };
}
/**
 * Creates a standard error response
 *
 * @param error - Error message or Error object
 * @param meta - Optional additional metadata (including debug data)
 * @returns A standardized error response
 *
 * @example
 * return createStandardErrorResponse(
 *   'Resource not found',
 *   { error_code: 'NOT_FOUND', debug: debugData }
 * );
 */
export function createStandardErrorResponse(error, meta, requestDebug) {
    const errorMessage = typeof error === 'string'
        ? error
        : extractDetailedErrorInfo(error);
    // Extract API error details if available
    const apiErrorDetails = isDatoCMSApiError(error) ? error : undefined;
    // Merge API error details with provided metadata
    const mergedMeta = {
        ...meta,
        ...(apiErrorDetails && { error_details: apiErrorDetails })
    };
    // Add debug error information if debug mode is enabled
    if (isDebugEnabled(requestDebug) && mergedMeta.debug && typeof error !== 'string') {
        if (!mergedMeta.debug.error) {
            mergedMeta.debug.error = formatErrorForDebug(error, requestDebug);
        }
    }
    // Remove debug data if not in debug mode
    if (mergedMeta.debug && !isDebugEnabled(requestDebug)) {
        delete mergedMeta.debug;
    }
    return {
        success: false,
        error: errorMessage,
        ...(Object.keys(mergedMeta).length > 0 && { meta: mergedMeta })
    };
}
/**
 * Creates a standard paginated response
 *
 * @param items - The paginated items
 * @param pagination - Pagination information
 * @param message - Optional success message
 * @param meta - Optional additional metadata (including debug data)
 * @returns A standardized paginated response
 *
 * @example
 * return createStandardPaginatedResponse(
 *   records,
 *   { limit: 10, offset: 0, total: 42, has_more: true },
 *   'Found 42 record(s) matching your query',
 *   { debug: debugData }
 * );
 */
export function createStandardPaginatedResponse(items, pagination, message, meta, requestDebug) {
    const finalMeta = {
        pagination,
        ...meta
    };
    // Remove debug data if not in debug mode
    if (finalMeta.debug && !isDebugEnabled(requestDebug)) {
        delete finalMeta.debug;
    }
    return {
        success: true,
        data: items,
        ...(message && { message }),
        meta: finalMeta
    };
}
/**
 * Creates a standard validation error response
 *
 * @param message - Error message
 * @param validationErrors - Array of validation errors
 * @param meta - Optional additional metadata (including debug data)
 * @returns A standardized validation error response
 *
 * @example
 * return createStandardValidationErrorResponse(
 *   'Validation failed',
 *   [{ path: 'name', message: 'Name is required' }],
 *   { debug: debugData }
 * );
 */
export function createStandardValidationErrorResponse(message, validationErrors, meta, requestDebug) {
    const finalMeta = {
        validation_errors: validationErrors,
        error_code: 'VALIDATION_ERROR',
        ...meta
    };
    // Remove debug data if not in debug mode
    if (finalMeta.debug && !isDebugEnabled(requestDebug)) {
        delete finalMeta.debug;
    }
    return {
        success: false,
        error: message,
        meta: finalMeta
    };
}
/**
 * Creates an MCP Response from a StandardResponse
 *
 * @param response - The standard response to convert
 * @returns An MCP Response object
 */
export function createStandardMcpResponse(response) {
    return createResponse(JSON.stringify(response, null, 2));
}
/**
 * Factory function that wraps a handler to ensure it returns a standardized response
 *
 * @param handler - The handler function to wrap
 * @returns A wrapped handler that returns standardized responses
 *
 * @example
 * export const standardizedHandler = withStandardResponse(
 *   async (args) => {
 *     // Handler implementation
 *     return { id: '123', name: 'Example' };
 *   }
 * );
 */
export function withStandardResponse(handler) {
    return async function (args) {
        try {
            const result = await handler(args);
            const standardResponse = createStandardSuccessResponse(result);
            return createStandardMcpResponse(standardResponse);
        }
        catch (error) {
            const standardResponse = createStandardErrorResponse(error);
            return createStandardMcpResponse(standardResponse);
        }
    };
}
