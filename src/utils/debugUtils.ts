import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Debug configuration
const DEBUG_ENABLED = process.env.DEBUG === 'true';
const TRACK_PERFORMANCE = process.env.TRACK_PERFORMANCE === 'true';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Sensitive field patterns to sanitize
const SENSITIVE_PATTERNS = [
  'api_token',
  'apiToken',
  'token',
  'password',
  'secret',
  'key',
  'authorization',
  'auth',
  'credential',
  'access_token',
  'refresh_token'
];

// Debug context for tracking execution
export interface DebugContext {
  operation: string;
  handler: string;
  domain: string;
  timestamp: number;
  requestId?: string;
  parameters?: Record<string, any>;
  performance?: PerformanceMetrics;
  trace?: string[];
  error?: any;
}

// Performance metrics
export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  apiCallDuration?: number;
  validationDuration?: number;
  stages?: Record<string, number>;
}

// Debug data structure
export interface DebugData {
  context: DebugContext;
  request?: {
    params?: Record<string, any>;
    query?: Record<string, any>;
    body?: Record<string, any>;
    headers?: Record<string, string>;
  };
  response?: {
    status?: number;
    dataSize?: number;
    dataType?: string;
  };
  api?: {
    endpoint?: string;
    method?: string;
    duration?: number;
    attempts?: number;
  };
  validation?: {
    schema?: string;
    errors?: any[];
    duration?: number;
  };
  error?: {
    type?: string;
    message?: string;
    stack?: string;
    details?: any;
  };
  metadata?: Record<string, any>;
}

// Check if debug mode is enabled
export function isDebugEnabled(requestDebug?: boolean): boolean {
  // Request-level debug takes precedence over environment variable
  if (requestDebug !== undefined) {
    return requestDebug;
  }
  return DEBUG_ENABLED;
}

// Check if performance tracking is enabled
export function isPerformanceTrackingEnabled(requestDebug?: boolean): boolean {
  // If debug is enabled via request, also enable performance tracking
  if (requestDebug === true) {
    return true;
  }
  return TRACK_PERFORMANCE || DEBUG_ENABLED;
}

// Sanitize sensitive data from objects
export function sanitizeSensitiveData(data: any): any {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeSensitiveData(item));
  }
  
  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_PATTERNS.some(pattern => 
        lowerKey.includes(pattern.toLowerCase())
      );
      
      if (isSensitive) {
        if (typeof value === 'string' && value.length > 0) {
          // Show first 4 and last 4 characters for debugging
          const masked = value.length > 12 
            ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
            : '***REDACTED***';
          sanitized[key] = masked;
        } else {
          sanitized[key] = '***REDACTED***';
        }
      } else {
        sanitized[key] = sanitizeSensitiveData(value);
      }
    }
    
    return sanitized;
  }
  
  return data;
}

// Create a debug context
export function createDebugContext(params: {
  operation: string;
  handler: string;
  domain: string;
  requestId?: string;
  parameters?: Record<string, any>;
  requestDebug?: boolean;
}): DebugContext {
  return {
    ...params,
    timestamp: Date.now(),
    parameters: params.parameters ? sanitizeSensitiveData(params.parameters) : undefined,
    trace: [],
    performance: isPerformanceTrackingEnabled(params.requestDebug) ? {
      startTime: Date.now()
    } : undefined
  };
}

// Add trace to debug context
export function addTrace(context: DebugContext, message: string): void {
  if (context.trace) {
    const timestamp = Date.now() - context.timestamp;
    context.trace.push(`[+${timestamp}ms] ${message}`);
  }
}

// Update performance metrics
export function updatePerformance(
  context: DebugContext, 
  stage?: string, 
  duration?: number
): void {
  if (!context.performance) return;
  
  if (stage && duration !== undefined) {
    if (!context.performance.stages) {
      context.performance.stages = {};
    }
    context.performance.stages[stage] = duration;
  }
  
  context.performance.endTime = Date.now();
  context.performance.duration = context.performance.endTime - context.performance.startTime;
}

// Create debug data from context
export function createDebugData(
  context: DebugContext,
  additionalData?: Partial<DebugData>,
  requestDebug?: boolean
): DebugData | undefined {
  if (!isDebugEnabled(requestDebug)) return undefined;
  
  const debugData: DebugData = {
    context: {
      ...context,
      parameters: context.parameters ? sanitizeSensitiveData(context.parameters) : undefined
    },
    ...additionalData
  };
  
  // Sanitize all additional data
  if (debugData.request) {
    debugData.request = sanitizeSensitiveData(debugData.request);
  }
  
  if (debugData.api) {
    debugData.api = sanitizeSensitiveData(debugData.api);
  }
  
  if (debugData.validation) {
    debugData.validation = sanitizeSensitiveData(debugData.validation);
  }
  
  if (debugData.error && debugData.error.stack && !isDebugEnabled(requestDebug)) {
    // Only include stack traces in debug mode
    delete debugData.error.stack;
  }
  
  return debugData;
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get data size estimation
export function getDataSize(data: any): number {
  try {
    return JSON.stringify(data).length;
  } catch {
    return 0;
  }
}

// Create a simple performance timer
export function createTimer(): { stop: () => number } {
  const start = Date.now();
  return {
    stop: () => Date.now() - start
  };
}

// Debug-aware error formatter
export function formatErrorForDebug(error: any, requestDebug?: boolean): any {
  if (!isDebugEnabled(requestDebug)) {
    // In production, only return safe error info
    return {
      message: error?.message || 'An error occurred',
      type: error?.constructor?.name || 'Error'
    };
  }
  
  // In debug mode, include more details
  return {
    message: error?.message || 'An error occurred',
    type: error?.constructor?.name || 'Error',
    stack: error?.stack,
    details: error?.details || error?.body || error?.response?.body,
    code: error?.code,
    statusCode: error?.statusCode || error?.status
  };
}

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Check if should log at level
export function shouldLog(level: LogLevel): boolean {
  const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
  const currentLevelIndex = levels.indexOf(LOG_LEVEL as LogLevel);
  const requestedLevelIndex = levels.indexOf(level);
  
  return currentLevelIndex >= requestedLevelIndex;
}

// Create a debug logger that returns data instead of console.log
export function createDebugLogger(context: DebugContext) {
  return {
    error: (message: string, data?: any) => {
      if (shouldLog(LogLevel.ERROR)) {
        addTrace(context, `ERROR: ${message}`);
        if (data) {
          context.error = formatErrorForDebug(data);
        }
      }
    },
    warn: (message: string, data?: any) => {
      if (shouldLog(LogLevel.WARN)) {
        addTrace(context, `WARN: ${message}`);
      }
    },
    info: (message: string, data?: any) => {
      if (shouldLog(LogLevel.INFO)) {
        addTrace(context, `INFO: ${message}`);
      }
    },
    debug: (message: string, data?: any) => {
      if (shouldLog(LogLevel.DEBUG)) {
        addTrace(context, `DEBUG: ${message}`);
      }
    }
  };
}