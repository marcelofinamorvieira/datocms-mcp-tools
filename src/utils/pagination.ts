import { z } from "zod";
import { paginationSchema } from "./sharedSchemas.js";

/**
 * Pagination utility functions and constants for DatoCMS MCP server
 * 
 * Provides consistent pagination handling across all schema files
 */

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION = {
  offset: 0,
  limit: 100
};

/**
 * Maximum allowed limit for pagination
 */
export const MAX_PAGINATION_LIMIT = 500;

/**
 * Create a paginated result wrapper type
 * @param T The type of items in the paginated results
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total_count: number;
    offset: number;
    limit: number;
  };
}

/**
 * Process pagination parameters from the request
 * Ensures consistent handling of pagination across handlers
 */
export function processPagination(params: z.infer<typeof paginationSchema>) {
  const { offset = DEFAULT_PAGINATION.offset, limit = DEFAULT_PAGINATION.limit } = params;
  
  // Ensure limit doesn't exceed maximum
  const validatedLimit = Math.min(limit, MAX_PAGINATION_LIMIT);
  
  return {
    offset,
    limit: validatedLimit
  };
}

/**
 * Create a paginated result object with consistent structure
 */
export function createPaginatedResult<T>(
  items: T[],
  totalCount: number,
  pagination: z.infer<typeof paginationSchema>
): PaginatedResult<T> {
  const { offset, limit } = processPagination(pagination);
  
  return {
    data: items,
    meta: {
      total_count: totalCount,
      offset,
      limit
    }
  };
}

/**
 * Apply pagination to an array of items
 * Used for in-memory pagination
 */
export function paginateArray<T>(
  items: T[],
  pagination: z.infer<typeof paginationSchema>
): PaginatedResult<T> {
  const { offset, limit } = processPagination(pagination);
  const paginatedItems = items.slice(offset, offset + limit);
  
  return createPaginatedResult(paginatedItems, items.length, pagination);
}

/**
 * Convert pagination parameters to CMA client format
 * The DatoCMS CMA client uses a specific pagination format
 */
export function toCmaClientPagination(pagination: z.infer<typeof paginationSchema>) {
  const { offset, limit } = processPagination(pagination);
  
  return {
    page: {
      offset,
      limit
    }
  };
}

export default {
  DEFAULT_PAGINATION,
  MAX_PAGINATION_LIMIT,
  processPagination,
  createPaginatedResult,
  paginateArray,
  toCmaClientPagination
};