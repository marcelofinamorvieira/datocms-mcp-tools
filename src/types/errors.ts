/**
 * Discriminated union types for DatoCMS errors
 * Provides type-safe error handling with rich context
 * 
 * Each error type has:
 * - A discriminant 'type' field for type narrowing
 * - A 'code' field for programmatic error handling
 * - Context-specific fields for debugging
 * - Timestamp for error tracking
 */

import { EntityType } from './constants.js';

// Base error interface
interface BaseError {
  timestamp: string;
  requestId?: string;
  traceId?: string;
}

// Specific error types with discriminated unions

export interface ValidationError extends BaseError {
  type: 'validation_error';
  code: 'VALIDATION_FAILED';
  field: string;
  message: string;
  value?: unknown;
  constraints?: Record<string, unknown>;
  details?: {
    expected?: string;
    received?: string;
    path?: string[];
  };
}

export interface NotFoundError extends BaseError {
  type: 'not_found';
  code: 'NOT_FOUND';
  resource: EntityType;
  id: string;
  message?: string;
}

export interface AuthError extends BaseError {
  type: 'auth_error';
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_TOKEN' | 'TOKEN_EXPIRED';
  reason: string;
  scopes?: string[];
  requiredScopes?: string[];
}

export interface RateLimitError extends BaseError {
  type: 'rate_limit';
  code: 'RATE_LIMITED';
  limit: number;
  remaining: number;
  reset: string; // ISO timestamp
  retryAfter: number; // seconds
  resource?: string;
}

export interface ApiError extends BaseError {
  type: 'api_error';
  code: 'API_ERROR' | 'BAD_REQUEST' | 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE';
  statusCode: number;
  message: string;
  body?: unknown;
  endpoint?: string;
  method?: string;
}

export interface ConflictError extends BaseError {
  type: 'conflict';
  code: 'CONFLICT' | 'DUPLICATE' | 'ALREADY_EXISTS';
  resource: EntityType;
  field?: string;
  value?: string;
  message: string;
  existingId?: string;
}

export interface QuotaError extends BaseError {
  type: 'quota_exceeded';
  code: 'QUOTA_EXCEEDED';
  resource: 'items' | 'uploads' | 'api_calls' | 'build_triggers';
  limit: number;
  current: number;
  message: string;
}

export interface InvalidOperationError extends BaseError {
  type: 'invalid_operation';
  code: 'INVALID_OPERATION' | 'OPERATION_NOT_ALLOWED' | 'INVALID_STATE';
  operation: string;
  reason: string;
  currentState?: string;
  allowedStates?: string[];
}

export interface NetworkError extends BaseError {
  type: 'network_error';
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'CONNECTION_REFUSED';
  message: string;
  url?: string;
  timeout?: number;
}

// Union of all error types
export type DatoCMSError = 
  | ValidationError 
  | NotFoundError 
  | AuthError 
  | RateLimitError 
  | ApiError
  | ConflictError
  | QuotaError
  | InvalidOperationError
  | NetworkError;

// Error code union for exhaustive checking
export type DatoCMSErrorCode = DatoCMSError['code'];
export type DatoCMSErrorType = DatoCMSError['type'];

// Error constructors with proper types
export const DatoCMSErrors = {
  validation(field: string, message: string, details?: Partial<ValidationError>): ValidationError {
    return {
      type: 'validation_error',
      code: 'VALIDATION_FAILED',
      field,
      message,
      timestamp: new Date().toISOString(),
      ...details
    };
  },

  notFound(resource: EntityType, id: string, message?: string): NotFoundError {
    return {
      type: 'not_found',
      code: 'NOT_FOUND',
      resource,
      id,
      message: message || `${resource} with ID '${id}' not found`,
      timestamp: new Date().toISOString()
    };
  },

  unauthorized(reason: string, details?: { scopes?: string[]; requiredScopes?: string[] }): AuthError {
    return {
      type: 'auth_error',
      code: 'UNAUTHORIZED',
      reason,
      timestamp: new Date().toISOString(),
      ...details
    };
  },

  forbidden(reason: string, details?: { scopes?: string[]; requiredScopes?: string[] }): AuthError {
    return {
      type: 'auth_error',
      code: 'FORBIDDEN',
      reason,
      timestamp: new Date().toISOString(),
      ...details
    };
  },

  invalidToken(reason: string = 'Invalid API token'): AuthError {
    return {
      type: 'auth_error',
      code: 'INVALID_TOKEN',
      reason,
      timestamp: new Date().toISOString()
    };
  },

  tokenExpired(reason: string = 'API token has expired'): AuthError {
    return {
      type: 'auth_error',
      code: 'TOKEN_EXPIRED',
      reason,
      timestamp: new Date().toISOString()
    };
  },

  rateLimit(limit: number, remaining: number, reset: Date, retryAfter: number): RateLimitError {
    return {
      type: 'rate_limit',
      code: 'RATE_LIMITED',
      limit,
      remaining,
      reset: reset.toISOString(),
      retryAfter,
      timestamp: new Date().toISOString()
    };
  },

  api(statusCode: number, message: string, details?: Partial<ApiError>): ApiError {
    let code: ApiError['code'] = 'API_ERROR';
    if (statusCode === 400) code = 'BAD_REQUEST';
    else if (statusCode >= 500) code = 'INTERNAL_ERROR';
    else if (statusCode === 503) code = 'SERVICE_UNAVAILABLE';

    return {
      type: 'api_error',
      code,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      ...details
    };
  },

  conflict(resource: EntityType, message: string, details?: Partial<ConflictError>): ConflictError {
    return {
      type: 'conflict',
      code: details?.code || 'CONFLICT',
      resource,
      message,
      timestamp: new Date().toISOString(),
      ...details
    };
  },

  duplicate(resource: EntityType, field: string, value: string, existingId?: string): ConflictError {
    return {
      type: 'conflict',
      code: 'DUPLICATE',
      resource,
      field,
      value,
      message: `${resource} with ${field} '${value}' already exists`,
      existingId,
      timestamp: new Date().toISOString()
    };
  },

  quotaExceeded(resource: QuotaError['resource'], limit: number, current: number): QuotaError {
    return {
      type: 'quota_exceeded',
      code: 'QUOTA_EXCEEDED',
      resource,
      limit,
      current,
      message: `Quota exceeded for ${resource}: ${current}/${limit}`,
      timestamp: new Date().toISOString()
    };
  },

  invalidOperation(operation: string, reason: string, details?: Partial<InvalidOperationError>): InvalidOperationError {
    return {
      type: 'invalid_operation',
      code: details?.code || 'INVALID_OPERATION',
      operation,
      reason,
      timestamp: new Date().toISOString(),
      ...details
    };
  },

  network(message: string, details?: Partial<NetworkError>): NetworkError {
    return {
      type: 'network_error',
      code: details?.code || 'NETWORK_ERROR',
      message,
      timestamp: new Date().toISOString(),
      ...details
    };
  }
};

// Type guards for error checking
export function isDatoCMSError(error: unknown): error is DatoCMSError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'code' in error &&
    'timestamp' in error
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return isDatoCMSError(error) && error.type === 'validation_error';
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return isDatoCMSError(error) && error.type === 'not_found';
}

export function isAuthError(error: unknown): error is AuthError {
  return isDatoCMSError(error) && error.type === 'auth_error';
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return isDatoCMSError(error) && error.type === 'rate_limit';
}

export function isApiError(error: unknown): error is ApiError {
  return isDatoCMSError(error) && error.type === 'api_error';
}

export function isConflictError(error: unknown): error is ConflictError {
  return isDatoCMSError(error) && error.type === 'conflict';
}

export function isQuotaError(error: unknown): error is QuotaError {
  return isDatoCMSError(error) && error.type === 'quota_exceeded';
}

export function isInvalidOperationError(error: unknown): error is InvalidOperationError {
  return isDatoCMSError(error) && error.type === 'invalid_operation';
}

export function isNetworkError(error: unknown): error is NetworkError {
  return isDatoCMSError(error) && error.type === 'network_error';
}

// Helper to get error message based on type
export function getErrorMessage(error: DatoCMSError): string {
  switch (error.type) {
    case 'validation_error':
      return `Validation failed for field '${error.field}': ${error.message}`;
    
    case 'not_found':
      return error.message || `${error.resource} with ID '${error.id}' not found`;
    
    case 'auth_error':
      return `Authentication failed: ${error.reason}`;
    
    case 'rate_limit':
      return `Rate limit exceeded. Retry after ${error.retryAfter} seconds`;
    
    case 'api_error':
      return `API error (${error.statusCode}): ${error.message}`;
    
    case 'conflict':
      return error.message;
    
    case 'quota_exceeded':
      return error.message;
    
    case 'invalid_operation':
      return `Invalid operation '${error.operation}': ${error.reason}`;
    
    case 'network_error':
      return `Network error: ${error.message}`;
  }
}

// Helper to convert API errors to our error types
export function fromApiError(apiError: any): DatoCMSError {
  // Handle DatoCMS API error format
  if (apiError.errors && Array.isArray(apiError.errors)) {
    const firstError = apiError.errors[0];
    if (firstError.code === 'VALIDATION_FAILED') {
      return DatoCMSErrors.validation(
        firstError.source?.pointer || 'unknown',
        firstError.detail,
        { details: firstError }
      );
    }
    if (firstError.code === 'NOT_FOUND') {
      return DatoCMSErrors.notFound(
        'item' as EntityType, // Default, should be overridden by caller
        firstError.source?.parameter || 'unknown',
        firstError.detail
      );
    }
  }

  // Handle HTTP status codes
  if (apiError.status || apiError.statusCode) {
    const status = apiError.status || apiError.statusCode;
    return DatoCMSErrors.api(status, apiError.message || 'Unknown API error', {
      body: apiError.body || apiError
    });
  }

  // Default to generic API error
  return DatoCMSErrors.api(500, 'Unknown error', { body: apiError });
}