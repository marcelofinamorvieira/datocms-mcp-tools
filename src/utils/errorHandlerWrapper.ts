/**
 * @file errorHandlerWrapper.ts
 * @description Unified error handling wrapper for DatoCMS MCP handlers
 * @module utils
 *
 * Provides consistent error handling across all handlers.
 */

import {
  DatoCMSApiError,
  isDatoCMSApiError,
  isAuthorizationError,
  isNotFoundError,
  isValidationError,
  isVersionConflictError,
  extractDetailedErrorInfo
} from "./errorHandlers.js";
import { HandlerResponse, createResponse, Response } from "./responseHandlers.js";

/**
 * Error context type for more detailed error information
 */
export type ErrorContext = {
  /** Handler context name for better error messages */
  handlerName?: string;
  /** Resource type (e.g., 'record', 'item_type', etc.) */
  resourceType?: string;
  /** Resource identifier if available */
  resourceId?: string | number;
  /** Additional context-specific information */
  additionalInfo?: Record<string, any>;
};

/**
 * Common error messages to ensure consistency
 */
export const ERROR_MESSAGES = {
  AUTHORIZATION: "Invalid API token or insufficient permissions. Please check your credentials.",
  NOT_FOUND: (resourceType?: string, id?: string | number) => 
    `${resourceType ? `${resourceType}` : 'Resource'}${id ? ` with ID '${id}'` : ''} not found. Please check the ID and try again.`,
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
export const handleErrorWithContext = (
  error: unknown, 
  context?: ErrorContext
): HandlerResponse<DatoCMSApiError> => {
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
export function withErrorHandling<Args, Result>(
  handlerFn: (args: Args) => Promise<Result | Response>,
  context?: ErrorContext
): (args: Args) => Promise<Result | Response> {
  return async function(args: Args): Promise<Result | Response> {
    try {
      return await handlerFn(args);
    } catch (error: unknown) {
      const errorResult = handleErrorWithContext(error, context);
      // Convert to MCP response format
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
export async function withErrorHandlingResult<T>(
  operation: () => Promise<T>,
  context?: ErrorContext
): Promise<HandlerResponse<T | DatoCMSApiError>> {
  try {
    const result = await operation();
    return {
      status: 'success',
      data: result
    };
  } catch (error: unknown) {
    return handleErrorWithContext(error, context);
  }
}