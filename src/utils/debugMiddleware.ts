/**
 * @file debugMiddleware.ts
 * @description Middleware for adding debug tracking to handlers
 * @module utils
 * 
 * This file provides middleware that can be composed with handlers to add
 * automatic debug tracking, performance monitoring, and execution tracing.
 */

import { Handler } from "./schemaValidationWrapper.js";
import { Response } from "./responseHandlers.js";
import {
  createDebugContext,
  createDebugData,
  updatePerformance,
  addTrace,
  createTimer,
  getDataSize,
  formatBytes,
  createDebugLogger,
  DebugContext,
  isDebugEnabled,
  isPerformanceTrackingEnabled
} from "./debugUtils.js";

/**
 * Debug middleware options
 */
export interface DebugMiddlewareOptions {
  /** Domain the handler belongs to */
  domain: string;
  /** Operation name */
  operation: string;
  /** Handler name */
  handlerName: string;
  /** Schema name for validation tracking */
  schemaName?: string;
  /** Entity type being operated on */
  entityType?: string;
  /** Whether to include request data in debug output */
  includeRequestData?: boolean;
}

/**
 * Creates a debug middleware that wraps handlers with debug tracking
 * 
 * @param options Debug middleware options
 * @returns Middleware function that adds debug tracking
 * 
 * @example
 * const debugMiddleware = withDebugTracking({
 *   domain: 'records',
 *   operation: 'create',
 *   handlerName: 'createRecordHandler'
 * });
 * 
 * const handler = composeMiddleware(baseHandler, [
 *   debugMiddleware,
 *   errorHandlingMiddleware,
 *   validationMiddleware
 * ]);
 */
export function withDebugTracking(options: DebugMiddlewareOptions) {
  const { 
    domain, 
    operation, 
    handlerName,
    schemaName,
    entityType,
    includeRequestData = true
  } = options;
  
  return function<T, R>(handler: Handler<T, R>): Handler<T, R> {
    return async function debugTrackedHandler(args: T): Promise<R> {
      // Extract the debug flag from the request parameters
      const requestDebug = (args as any)?.debug;
      
      // If debug is not enabled, just pass through
      if (!isDebugEnabled(requestDebug) && !isPerformanceTrackingEnabled(requestDebug)) {
        return handler(args);
      }
      
      // Create debug context
      const context = createDebugContext({
        operation,
        handler: handlerName,
        domain,
        parameters: includeRequestData ? (args as Record<string, any>) : undefined,
        requestDebug
      });
      
      const logger = createDebugLogger(context);
      const overallTimer = createTimer();
      
      try {
        // Track handler start
        addTrace(context, `Starting ${handlerName}`);
        logger.info(`Executing ${operation} operation`, { 
          entity: entityType,
          schema: schemaName 
        });
        
        // Execute the handler
        const handlerTimer = createTimer();
        const result = await handler(args);
        const handlerDuration = handlerTimer.stop();
        
        // Update performance metrics
        updatePerformance(context, 'handler', handlerDuration);
        addTrace(context, `Handler completed in ${handlerDuration}ms`);
        
        // Calculate response size if result is serializable
        let responseSize = 0;
        let dataType: string = typeof result;
        
        if (result && typeof result === 'object') {
          responseSize = getDataSize(result);
          dataType = Array.isArray(result) ? 'array' : 'object';
        }
        
        // Log success
        const totalDuration = overallTimer.stop();
        logger.info(`Completed successfully in ${totalDuration}ms`, {
          size: formatBytes(responseSize),
          dataType
        });
        
        // Add debug data to the response if it's a Response object
        if (isDebugEnabled(requestDebug) && result && typeof result === 'object' && 'content' in result) {
          try {
            const response = result as Response;
            // Extract text from first content block
            const firstBlock = response.content[0];
            if (firstBlock && firstBlock.type === 'text') {
              const responseData = JSON.parse(firstBlock.text);
              
              // Create debug data
              const debugData = createDebugData(context, {
                response: {
                  dataSize: responseSize,
                  dataType: dataType
                }
              }, requestDebug);
              
              // Add debug data to response metadata
              if (!responseData.meta) {
                responseData.meta = {};
              }
              responseData.meta.debug = debugData;
              
              // Update the response
              (result as Response).content[0].text = JSON.stringify(responseData, null, 2);
            }
          } catch (e) {
            // If we can't parse/modify the response, just continue
            logger.debug('Could not add debug data to response', { error: e });
          }
        }
        
        return result;
        
      } catch (error: unknown) {
        // Track error
        const totalDuration = overallTimer.stop();
        logger.error(`Failed after ${totalDuration}ms`, error);
        
        // Re-throw the error for the error handling middleware to catch
        throw error;
      }
    };
  };
}

/**
 * Creates a debug context injector middleware that passes context to handlers
 * This is useful for handlers that need access to the debug context
 * 
 * @param options Debug middleware options
 * @returns Middleware function that injects debug context
 * 
 * @example
 * const contextInjector = withDebugContextInjection({
 *   domain: 'records',
 *   operation: 'create',
 *   handlerName: 'createRecordHandler'
 * });
 */
export function withDebugContextInjection(options: DebugMiddlewareOptions) {
  return function<T, R>(handler: Handler<T, R>): Handler<T, R> {
    return async function debugContextInjectedHandler(args: T): Promise<R> {
      // Extract the debug flag from the request parameters
      const requestDebug = (args as any)?.debug;
      
      // Create debug context
      const context = createDebugContext({
        operation: options.operation,
        handler: options.handlerName,
        domain: options.domain,
        parameters: options.includeRequestData ? (args as Record<string, any>) : undefined,
        requestDebug
      });
      
      // If the handler accepts a second parameter, pass the context
      if (handler.length > 1) {
        return (handler as any)(args, context);
      }
      
      // Otherwise, just call the handler normally
      return handler(args);
    };
  };
}

/**
 * Extracts debug information from a response and adds it to the metadata
 * This is useful for adding debug info after the response is created
 * 
 * @param response The response to enhance
 * @param context The debug context
 * @param additionalData Additional debug data to include
 * @returns The enhanced response
 */
export function enhanceResponseWithDebug(
  response: Response,
  context: DebugContext,
  additionalData?: any,
  requestDebug?: boolean
): Response {
  if (!isDebugEnabled(requestDebug)) {
    return response;
  }
  
  try {
    // Extract text from first content block
    const firstBlock = response.content[0];
    if (!firstBlock || firstBlock.type !== 'text') {
      return response;
    }
    const responseData = JSON.parse(firstBlock.text);
    
    // Create debug data
    const debugData = createDebugData(context, additionalData, requestDebug);
    
    // Add debug data to response metadata
    if (!responseData.meta) {
      responseData.meta = {};
    }
    responseData.meta.debug = debugData;
    
    // Create new response with debug data
    return {
      ...response,
      content: [{
        type: 'text' as const,
        text: JSON.stringify(responseData, null, 2)
      }]
    };
  } catch (e) {
    // If we can't parse/modify the response, return original
    return response;
  }
}

/**
 * Performance tracking middleware that only tracks timing without full debug data
 * This is lighter weight than full debug tracking
 * 
 * @param handlerName The name of the handler for logging
 * @returns Middleware function that tracks performance
 */
export function withPerformanceTracking(handlerName: string) {
  return function<T, R>(handler: Handler<T, R>): Handler<T, R> {
    return async function performanceTrackedHandler(args: T): Promise<R> {
      // Extract the debug flag from the request parameters
      const requestDebug = (args as any)?.debug;
      
      if (!isPerformanceTrackingEnabled(requestDebug)) {
        return handler(args);
      }
      
      const timer = createTimer();
      
      try {
        const result = await handler(args);
        const duration = timer.stop();
        
        // Add timing to response if possible
        if (result && typeof result === 'object' && 'content' in result) {
          try {
            const response = result as Response;
            const firstBlock = response.content[0];
            if (firstBlock && firstBlock.type === 'text') {
              const responseData = JSON.parse(firstBlock.text);
              
              if (!responseData.meta) {
                responseData.meta = {};
              }
              responseData.meta.duration = duration;
              
              (result as Response).content[0].text = JSON.stringify(responseData, null, 2);
            }
          } catch (e) {
            // Continue without timing
          }
        }
        
        return result;
      } catch (error) {
        const duration = timer.stop();
        
        // Could enhance error with timing here if needed
        throw error;
      }
    };
  };
}