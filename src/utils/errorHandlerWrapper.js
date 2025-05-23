/**
 * @file errorHandlerWrapper.ts
 * @description Unified error handling wrapper for DatoCMS MCP handlers
 * Provides consistent error handling across all handlers
 */
import { isDatoCMSApiError, isAuthorizationError, isNotFoundError, isValidationError, isVersionConflictError, extractDetailedErrorInfo } from "./errorHandlers.js";
import { createResponse } from "./responseHandlers.js";
import { createStandardErrorResponse, createStandardMcpResponse } from "./standardResponse.js";
import { isDebugEnabled, createDebugData } from "./debugUtils.js";
/**
 * Common error messages to ensure consistency
 */
export const ERROR_MESSAGES = {
    AUTHORIZATION: "Invalid API token or insufficient permissions. Please check your credentials.",
    NOT_FOUND: (resourceType, id) => `${resourceType ? `${resourceType}` : 'Resource'}${id ? ` with ID '${id}'` : ''} not found. Please check the ID and try again.`,
    VALIDATION: "Validation error. Please check your input data.",
    VERSION_CONFLICT: "Version conflict. The record has been modified since you retrieved it. Please fetch the latest version and try again.",
    GENERAL: "An error occurred while processing your request.",
    LOCALIZATION: `Localization error. Please check that:
1. For localized fields, you've provided values for all required locales
2. The locales are consistent across all localized fields
3. You're using the correct locale codes as defined in your project settings`,
};
/**
 * Consistent error handling function with detailed contextual information
 */
export const handleErrorWithContext = (error, context) => {
    const { handlerName, resourceType, resourceId, additionalInfo } = context || {};
    const contextPrefix = handlerName ? `Error in ${handlerName}: ` : 'Error: ';
    if (isAuthorizationError(error)) {
        return {
            status: 'error',
            message: `${contextPrefix}${ERROR_MESSAGES.AUTHORIZATION}`,
            ...(isDatoCMSApiError(error) && { data: error })
        };
    }
    if (isNotFoundError(error)) {
        return {
            status: 'error',
            message: `${contextPrefix}${ERROR_MESSAGES.NOT_FOUND(resourceType, resourceId)}`,
            ...(isDatoCMSApiError(error) && { data: error })
        };
    }
    if (isValidationError(error)) {
        // Check for localization-specific errors
        const detailedError = extractDetailedErrorInfo(error);
        if (detailedError.includes("locales")) {
            return {
                status: 'error',
                message: `${contextPrefix}${ERROR_MESSAGES.LOCALIZATION}
${detailedError}`,
                ...(isDatoCMSApiError(error) && { data: error })
            };
        }
        return {
            status: 'error',
            message: `${contextPrefix}${ERROR_MESSAGES.VALIDATION} ${detailedError}`,
            ...(isDatoCMSApiError(error) && { data: error })
        };
    }
    if (isVersionConflictError(error)) {
        return {
            status: 'error',
            message: `${contextPrefix}${ERROR_MESSAGES.VERSION_CONFLICT}`,
            ...(isDatoCMSApiError(error) && { data: error })
        };
    }
    // Generic error case
    return {
        status: 'error',
        message: `${contextPrefix}${extractDetailedErrorInfo(error)}`,
        ...(isDatoCMSApiError(error) && { data: error }),
        ...(additionalInfo && { additionalInfo })
    };
};
/**
 * Higher-order function to wrap handler functions with unified error handling
 * @param handlerFn The handler function to wrap
 * @param context Error context information
 * @returns A new handler function with error handling
 */
export function withErrorHandling(handlerFn, context) {
    return async function (args) {
        try {
            return await handlerFn(args);
        }
        catch (error) {
            // Check if debug mode is enabled and we have debug context from middleware
            if (isDebugEnabled() && args?._debugContext) {
                const debugContext = args._debugContext;
                // Create debug data with error information
                const debugData = createDebugData(debugContext, {
                    error: {
                        type: error?.constructor?.name || 'Error',
                        message: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : undefined
                    },
                    metadata: {
                        errorContext: context
                    }
                });
                // Determine error type and code
                let errorCode = 'UNKNOWN_ERROR';
                if (isAuthorizationError(error))
                    errorCode = 'UNAUTHORIZED';
                else if (isNotFoundError(error))
                    errorCode = 'NOT_FOUND';
                else if (isValidationError(error))
                    errorCode = 'VALIDATION_ERROR';
                else if (isVersionConflictError(error))
                    errorCode = 'VERSION_CONFLICT';
                // Use standard error response with debug data
                return createStandardMcpResponse(createStandardErrorResponse(error, {
                    error_code: errorCode,
                    debug: debugData
                }));
            }
            // Fall back to original error handling for backward compatibility
            const errorResult = handleErrorWithContext(error, context);
            return createResponse(errorResult);
        }
    };
}
/**
 * Wraps async operation with consistent error handling and returns HandlerResponse
 * Useful for non-handler functions that still need consistent error handling
 * @param operation The async operation to execute
 * @param context Error context information
 * @returns A HandlerResponse with either success data or structured error
 */
export async function withErrorHandlingResult(operation, context) {
    try {
        const result = await operation();
        return {
            status: 'success',
            data: result
        };
    }
    catch (error) {
        return handleErrorWithContext(error, context);
    }
}
