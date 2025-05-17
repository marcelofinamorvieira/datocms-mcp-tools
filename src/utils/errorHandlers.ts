/**
 * @file errorHandlers.ts
 * @description Utility functions for error handling and response formatting
 * @module utils
 */

import { HandlerResponse, createResponse, Response } from "./responseHandlers.js";

/**
 * DatoCMS API Error types
 */
export type DatoCMSApiError = {
  status?: number;
  code?: string;
  message?: string;
  errors?: any[];
  data?: {
    errors?: any[];
  };
};

/**
 * Type guard for DatoCMS API errors
 */
export function isDatoCMSApiError(error: unknown): error is DatoCMSApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (('status' in error && typeof error.status === 'number') ||
     ('code' in error && typeof error.code === 'string') ||
     ('errors' in error && Array.isArray((error as any).errors)) ||
     ('data' in error && typeof (error as any).data === 'object' && (error as any).data !== null && 'errors' in (error as any).data))
  );
}

/**
 * Utility function to check if an error is an authorization error
 */
export const isAuthorizationError = (error: unknown): boolean => {
  if (isDatoCMSApiError(error)) {
    // Return as boolean to avoid type issues
    return Boolean(
      error.status === 401 || 
      (error.code === 'UNAUTHORIZED') || 
      (error.message && (error.message.includes('401') || 
                        error.message.toLowerCase().includes('unauthorized')))
    );
  }

  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error && error.status === 401 ||
     'message' in error && typeof error.message === 'string' &&
     (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')))
  );
};

/**
 * Utility function to check if an error is a not found error
 */
export const isNotFoundError = (error: unknown): boolean => {
  if (isDatoCMSApiError(error)) {
    // Return as boolean to avoid type issues
    return Boolean(
      error.status === 404 || 
      (error.code === 'RECORD_NOT_FOUND') || 
      (error.message && (error.message.includes('404') || 
                        error.message.toLowerCase().includes('not found')))
    );
  }

  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error && error.status === 404 ||
     'message' in error && typeof error.message === 'string' &&
     (error.message.includes('404') || error.message.toLowerCase().includes('not found')))
  );
};

/**
 * Utility function to check if an error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  if (isDatoCMSApiError(error)) {
    // Return as boolean to avoid type issues
    return Boolean(
      error.status === 422 || 
      (error.code === 'VALIDATION_ERROR') || 
      (error.message && (error.message.includes('422') || 
                        error.message.toLowerCase().includes('validation')))
    );
  }

  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error && error.status === 422 ||
     'message' in error && typeof error.message === 'string' &&
     (error.message.includes('422') || error.message.toLowerCase().includes('validation')))
  );
};

/**
 * Utility function to check if an error is a version conflict error
 */
export const isVersionConflictError = (error: unknown): boolean => {
  if (isDatoCMSApiError(error)) {
    // Return as boolean to avoid type issues
    return Boolean(
      error.code === 'STALE_ITEM_VERSION' || 
      (error.message && error.message.toLowerCase().includes('version conflict'))
    );
  }

  return (
    typeof error === 'object' &&
    error !== null &&
    ('message' in error && typeof error.message === 'string' &&
     error.message.toLowerCase().includes('version conflict'))
  );
};

/**
 * Utility function to extract detailed information from DatoCMS API errors
 */
export const extractDetailedErrorInfo = (error: unknown): string => {
  if (!error) return 'Unknown error occurred';

  // Use the type guard to handle DatoCMS API errors
  if (isDatoCMSApiError(error)) {
    // Extract well-structured error information
    const statusInfo = error.status ? `Status: ${error.status}` : '';
    const codeInfo = error.code ? `Code: ${error.code}` : '';
    const messageInfo = error.message || '';
    
    // Extract detailed errors
    let detailedErrors = '';
    if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
      detailedErrors = `\nDetails: ${JSON.stringify(error.errors, null, 2)}`;
    } else if (error.data?.errors && Array.isArray(error.data.errors) && error.data.errors.length > 0) {
      detailedErrors = `\nDetails: ${JSON.stringify(error.data.errors, null, 2)}`;
    }

    const parts = [statusInfo, codeInfo, messageInfo].filter(part => part.length > 0);
    return `${parts.join(' - ')}${detailedErrors}`;
  }

  // If it's already a string, just return it
  if (typeof error === 'string') return error;

  // If it's an Error object
  if (error instanceof Error) {
    const errorMessage = error.message;

    try {
      // Try to find JSON in error message that might contain detailed error information
      const jsonMatch = errorMessage.match(/\{.*\}/s);
      if (jsonMatch) {
        const errorJson = JSON.parse(jsonMatch[0]);

        // If we have structured error data
        if (errorJson.data && errorJson.data.errors) {
          return `${errorMessage}\n\nDetails: ${JSON.stringify(errorJson.data.errors, null, 2)}`;
        }

        // If there are general errors
        if (errorJson.errors) {
          return `${errorMessage}\n\nDetails: ${JSON.stringify(errorJson.errors, null, 2)}`;
        }
      }

      // Try to parse out error details from common error formats
      if (errorMessage.includes('Unprocessable') || errorMessage.includes('422')) {
        const errorDetailsMatch = errorMessage.match(/422[^{]*(\{.*\})/s);
        if (errorDetailsMatch && errorDetailsMatch[1]) {
          try {
            const errorDetails = JSON.parse(errorDetailsMatch[1]);
            if (errorDetails.errors || errorDetails.data?.errors) {
              const errors = errorDetails.errors || errorDetails.data?.errors;
              return `${errorMessage}\n\nDetails: ${JSON.stringify(errors, null, 2)}`;
            }
          } catch (e) {
            // If parsing fails, continue with normal flow
          }
        }
      }
    } catch (e) {
      // If JSON parsing fails, continue with normal flow
    }

    return errorMessage;
  }

  // If it's an object
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      // Try to extract more info from the message
      return extractDetailedErrorInfo(error.message);
    }

    // If it has errors property with detailed information
    if ('errors' in error && (error as any).errors) {
      return `Error: ${JSON.stringify((error as any).errors, null, 2)}`;
    }

    // If it has data.errors with detailed information
    if ('data' in error &&
        typeof (error as any).data === 'object' &&
        (error as any).data !== null &&
        'errors' in (error as any).data) {
      return `Error: ${JSON.stringify((error as any).data.errors, null, 2)}`;
    }

    return JSON.stringify(error, null, 2);
  }

  // Default fallback
  return String(error);
};

/**
 * Utility function to create an error response with the correct MCP content structure
 */
export const createErrorResponse = (message: string): Response => {
  return {
    content: [{
      type: "text" as const,
      text: message
    }]
  };
};

/**
 * Creates a standardized error response object
 */
export const createErrorHandlerResponse = <T = unknown>(message: string, errorData?: T): HandlerResponse<T> => {
  return {
    status: 'error',
    message,
    ...(errorData !== undefined && { data: errorData })
  };
};

/**
 * Handles DatoCMS API errors with proper typing and consistent messaging
 */
export const handleDatoCMSApiError = (error: unknown, context?: string): HandlerResponse<DatoCMSApiError> => {
  const contextPrefix = context ? `Error in ${context}: ` : 'Error: ';
  
  if (isAuthorizationError(error)) {
    return createErrorHandlerResponse(
      `${contextPrefix}Invalid API token or insufficient permissions. Please check your credentials.`,
      isDatoCMSApiError(error) ? error : undefined
    );
  }
  
  if (isNotFoundError(error)) {
    return createErrorHandlerResponse(
      `${contextPrefix}Resource not found. Please check the ID and try again.`,
      isDatoCMSApiError(error) ? error : undefined
    );
  }
  
  if (isValidationError(error)) {
    return createErrorHandlerResponse(
      `${contextPrefix}Validation error. ${extractDetailedErrorInfo(error)}`,
      isDatoCMSApiError(error) ? error : undefined
    );
  }
  
  if (isVersionConflictError(error)) {
    return createErrorHandlerResponse(
      `${contextPrefix}Version conflict. The record has been modified since you retrieved it. Please fetch the latest version and try again.`,
      isDatoCMSApiError(error) ? error : undefined
    );
  }
  
  // Generic error case
  return createErrorHandlerResponse(
    `${contextPrefix}${extractDetailedErrorInfo(error)}`,
    isDatoCMSApiError(error) ? error : undefined
  );
};