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

import { createResponse, Response } from "./responseHandlers.js";
import { extractDetailedErrorInfo, isDatoCMSApiError } from "./errorHandlers.js";

/**
 * Standard pagination information
 */
export interface PaginationInfo {
  /**
   * Number of items per page
   */
  limit: number;
  
  /**
   * Starting position (zero-based)
   */
  offset: number;
  
  /**
   * Total number of items
   */
  total: number;
  
  /**
   * Whether there are more items beyond the current page
   */
  has_more: boolean;
}

/**
 * Standard metadata for responses
 */
export interface ResponseMetadata {
  /**
   * Pagination information (only for list operations)
   */
  pagination?: PaginationInfo;
  
  /**
   * Validation errors (only for validation failures)
   */
  validation_errors?: Array<{
    path: string;
    message: string;
  }>;
  
  /**
   * Error code (only for error responses)
   */
  error_code?: string;
  
  /**
   * Detailed error information (only for error responses)
   */
  error_details?: Record<string, unknown>;
  
  /**
   * Domain-specific metadata
   */
  [key: string]: unknown;
}

/**
 * Standard response format for all MCP handlers
 */
export interface StandardResponse<T = unknown> {
  /**
   * Whether the operation was successful
   */
  success: boolean;
  
  /**
   * Response data (only present on success)
   */
  data?: T;
  
  /**
   * Error message (only present on failure)
   */
  error?: string;
  
  /**
   * Informational message (can be present on success or failure)
   */
  message?: string;
  
  /**
   * Additional metadata about the response
   */
  meta?: ResponseMetadata;
}

/**
 * Creates a standard success response
 * 
 * @param data - The response data
 * @param message - Optional success message
 * @param meta - Optional additional metadata
 * @returns A standardized success response
 * 
 * @example
 * return createStandardSuccessResponse(
 *   { id: '123', name: 'Example' },
 *   'Resource created successfully'
 * );
 */
export function createStandardSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: Partial<ResponseMetadata>
): StandardResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta })
  };
}

/**
 * Creates a standard error response
 * 
 * @param error - Error message or Error object
 * @param meta - Optional additional metadata
 * @returns A standardized error response
 * 
 * @example
 * return createStandardErrorResponse(
 *   'Resource not found',
 *   { error_code: 'NOT_FOUND' }
 * );
 */
export function createStandardErrorResponse(
  error: string | Error | unknown,
  meta?: Partial<ResponseMetadata>
): StandardResponse<null> {
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
  
  return {
    success: false,
    error: errorMessage,
    ...(Object.keys(mergedMeta).length > 0 && { meta: mergedMeta as ResponseMetadata })
  };
}

/**
 * Creates a standard paginated response
 * 
 * @param items - The paginated items
 * @param pagination - Pagination information
 * @param message - Optional success message
 * @param meta - Optional additional metadata
 * @returns A standardized paginated response
 * 
 * @example
 * return createStandardPaginatedResponse(
 *   records,
 *   { limit: 10, offset: 0, total: 42, has_more: true },
 *   'Found 42 record(s) matching your query'
 * );
 */
export function createStandardPaginatedResponse<T>(
  items: T[],
  pagination: PaginationInfo,
  message?: string,
  meta?: Omit<ResponseMetadata, 'pagination'>
): StandardResponse<T[]> {
  return {
    success: true,
    data: items,
    ...(message && { message }),
    meta: {
      pagination,
      ...meta
    }
  };
}

/**
 * Creates a standard validation error response
 * 
 * @param message - Error message
 * @param validationErrors - Array of validation errors
 * @param meta - Optional additional metadata
 * @returns A standardized validation error response
 * 
 * @example
 * return createStandardValidationErrorResponse(
 *   'Validation failed',
 *   [{ path: 'name', message: 'Name is required' }]
 * );
 */
export function createStandardValidationErrorResponse(
  message: string,
  validationErrors: Array<{ path: string; message: string }>,
  meta?: Omit<ResponseMetadata, 'validation_errors'>
): StandardResponse<null> {
  return {
    success: false,
    error: message,
    meta: {
      validation_errors: validationErrors,
      error_code: 'VALIDATION_ERROR',
      ...meta
    }
  };
}

/**
 * Creates an MCP Response from a StandardResponse
 * 
 * @param response - The standard response to convert
 * @returns An MCP Response object
 */
export function createStandardMcpResponse<T>(response: StandardResponse<T>): Response {
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
export function withStandardResponse<T, A>(
  handler: (args: A) => Promise<T>
): (args: A) => Promise<Response> {
  return async function(args: A): Promise<Response> {
    try {
      const result = await handler(args);
      const standardResponse = createStandardSuccessResponse(result);
      return createStandardMcpResponse(standardResponse);
    } catch (error: unknown) {
      const standardResponse = createStandardErrorResponse(error);
      return createStandardMcpResponse(standardResponse);
    }
  };
}