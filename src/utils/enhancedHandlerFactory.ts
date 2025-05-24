/**
 * @file enhancedHandlerFactory.ts
 * @description Enhanced factory functions for creating handlers with middleware composition
 * Combines error handling, schema validation, and client management in a unified pattern
 */

import type { z } from "zod";
import { createResponse, Response as McpResponse } from "./responseHandlers.js";
import { UnifiedClientManager } from "./unifiedClientManager.js";
import { withErrorHandling, ErrorContext } from "./errorHandlerWrapper.js";
import { withSchemaValidation, Handler } from "./schemaValidationWrapper.js";
import { SchemaRegistry } from "./schemaRegistry.js";
import { withDebugTracking } from "./debugMiddleware.js";
import { 
  createStandardSuccessResponse, 
  createStandardMcpResponse
} from "./standardResponse.js";
import { Client } from "@datocms/cma-client-node";

// Re-export useful types
export { Client } from "@datocms/cma-client-node";

/**
 * The DatoCMS client type - just use the standard Client
 * All API methods are already available on this client
 */
export type DatoCMSClient = Client;

/**
 * Request context passed to client actions
 */
export interface RequestContext {
  apiToken: string;
  environment?: string;
  debug?: boolean;
}

/**
 * Type for a function that creates a client response object
 * @template T - The params type
 * @template R - The return type
 */
export type ClientActionFn<T, R> = (
  client: DatoCMSClient, 
  params: T,
  context: RequestContext
) => Promise<R>;

/**
 * Base parameters that all handlers must have
 */
export interface BaseParams {
  apiToken: string;
  environment?: string;
  debug?: boolean;
}

/**
 * Base handler options shared across all handler types
 */
export interface BaseHandlerOptions<T extends BaseParams> {
  /** The domain for schema registration and validation */
  domain: string;
  /** The schema name for this handler */
  schemaName: string;
  /** Schema for validation */
  schema: z.ZodType<T>;
  /** Error context for detailed error messages */
  errorContext?: ErrorContext;
}

/**
 * Options for create operation handler
 */
export interface CreateHandlerOptions<T extends BaseParams, R> extends BaseHandlerOptions<T> {
  /** Entity name for debugging and messages */
  entityName?: string;
  /** Message to display on successful creation */
  successMessage: string | ((result: R) => string);
  /** Custom client action function */
  clientAction: ClientActionFn<T, R>;
}

/**
 * Options for retrieve operation handler
 */
export interface RetrieveHandlerOptions<T extends BaseParams, R> extends BaseHandlerOptions<T> {
  /** Entity name for error messages */
  entityName: string;
  /** ID parameter name in the params object */
  idParam: keyof T;
  /** Custom client action function */
  clientAction: ClientActionFn<T, R>;
}

/**
 * Options for list operation handler
 */
export interface ListHandlerOptions<T extends BaseParams, R> extends BaseHandlerOptions<T> {
  /** Entity name for error messages */
  entityName: string;
  /** Custom client action function */
  clientAction: ClientActionFn<T, R[]>;
  /** Optional formatter for results */
  formatResult?: (results: R[], args: T) => any;
}

/**
 * Options for update operation handler
 */
export interface UpdateHandlerOptions<T extends BaseParams, R> extends BaseHandlerOptions<T> {
  /** Entity name for error messages */
  entityName: string;
  /** ID parameter name in the params object */
  idParam: keyof T;
  /** Custom client action function */
  clientAction: ClientActionFn<T, R>;
  /** Message to display on successful update */
  successMessage?: string | ((result: R) => string);
}

/**
 * Options for delete operation handler
 */
export interface DeleteHandlerOptions<T extends BaseParams> extends BaseHandlerOptions<T> {
  /** Entity name for error messages */
  entityName: string;
  /** ID parameter name in the params object */
  idParam: keyof T;
  /** Custom client action function */
  clientAction: ClientActionFn<T, void>;
  /** Message to display on successful deletion */
  successMessage?: string | ((id: any) => string);
}

/**
 * Function composition to apply a series of higher-order functions to a base handler
 * @param baseHandler The base handler function
 * @param middleware Array of higher-order functions to apply
 * @returns The composed handler with all middleware applied
 */
function composeMiddleware<T, R>(
  baseHandler: Handler<T, R>,
  middleware: Array<(handler: Handler<unknown, McpResponse>) => Handler<unknown, McpResponse>>
): Handler<unknown, McpResponse> {
  // Wrap the base handler to ensure it returns Response
  const responseHandler: Handler<unknown, McpResponse> = async (args: unknown): Promise<McpResponse> => {
    const result = await baseHandler(args as T);
    // If result is already a Response, return it
    if (result && typeof result === 'object' && 'content' in result) {
      return result as McpResponse;
    }
    // This should not happen with our current implementation
    throw new Error('Handler must return Response type');
  };
  
  // Apply middleware from right to left (last middleware runs first)
  return middleware.reduceRight(
    (handler, applyMiddleware) => applyMiddleware(handler),
    responseHandler
  );
}

/**
 * Creates a handler with error handling, schema validation, and client management
 * @param options Base handler options
 * @param clientAction Function to execute with the client
 * @param responseTransformer Function to transform the result into a response
 * @returns A fully composed handler with validation and error handling
 */
function createBaseHandler<T extends BaseParams, R>(
  options: BaseHandlerOptions<T>,
  clientAction: ClientActionFn<T, R>,
  responseTransformer: (result: R, requestDebug?: boolean) => any
): Handler<unknown, McpResponse> {
  const { domain, schemaName, schema, errorContext } = options;
  
  // Register the schema if it hasn't been registered yet
  SchemaRegistry.register(domain, schemaName, schema);
  
  // Define the base handler function
  const baseHandler: Handler<T, McpResponse> = async (params: T): Promise<McpResponse> => {
    // Extract client parameters - no type casting needed since T extends BaseParams
    const { apiToken, environment, debug: requestDebug } = params;
    
    // Create request context
    const context: RequestContext = {
      apiToken,
      environment,
      debug: requestDebug
    };
    
    // Get the standard DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    // Execute the client action with context
    const result = await clientAction(client, params, context);
    
    // Transform and return the result - pass the debug flag from params
    const transformedResult = responseTransformer(result, requestDebug);
    return createResponse(JSON.stringify(transformedResult, null, 2));
  };
  
  // Apply middleware to the base handler
  return composeMiddleware(baseHandler, [
    // Apply debug tracking middleware (outermost, runs first and last)
    (handler) => withDebugTracking({
      domain,
      operation: errorContext?.operation || 'unknown',
      handlerName: errorContext?.handlerName || `${domain}.${schemaName}`,
      schemaName,
      entityType: errorContext?.resourceType
    })(handler),
    // Apply error handling middleware
    (handler) => withErrorHandling(handler, errorContext),
    // Apply schema validation middleware
    (handler) => withSchemaValidation(domain, schemaName, handler)
  ]);
}

/**
 * Creates a handler function for create operations
 */
export function createCreateHandler<T extends BaseParams, R>(options: CreateHandlerOptions<T, R>): Handler<unknown, McpResponse> {
  const { successMessage, clientAction, errorContext } = options;
  
  // Create an enhanced error context
  const enhancedErrorContext: ErrorContext = {
    ...errorContext,
    handlerName: `${options.domain}.create.${options.schemaName}`,
    operation: 'create',
    resourceType: options.entityName || 'resource'
  };
  
  // Create the response transformer function
  const responseTransformer = (result: R, requestDebug?: boolean) => {
    const message = typeof successMessage === 'function' ? successMessage(result) : successMessage;
    return createStandardSuccessResponse(result, message, undefined, requestDebug);
  };
  
  return createBaseHandler(
    { ...options, errorContext: enhancedErrorContext },
    clientAction,
    responseTransformer
  );
}

/**
 * Creates a handler function for retrieve operations
 */
export function createRetrieveHandler<T extends BaseParams, R>(options: RetrieveHandlerOptions<T, R>): Handler<unknown, McpResponse> {
  const { entityName, idParam, clientAction } = options;
  
  // Create an enhanced error context
  const enhancedErrorContext: ErrorContext = {
    ...options.errorContext,
    handlerName: `${options.domain}.retrieve.${options.schemaName}`,
    operation: 'retrieve',
    resourceType: entityName
  };
  
  // Create the base handler with dynamic resourceId added to error context
  const baseHandler = async (params: T): Promise<R> => {
    const entityId = params[idParam];
    
    // Update error context with the resource ID
    enhancedErrorContext.resourceId = entityId as string | number;
    
    // Extract client parameters - no type casting needed since T extends BaseParams
    const { apiToken, environment } = params;
    
    // Create request context
    const context: RequestContext = {
      apiToken,
      environment,
      debug: params.debug
    };
    
    // Get the standard DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    // Execute the client action
    const result = await clientAction(client, params, context);
    
    // Check if entity was found
    if (!result) {
      throw new Error(`${entityName} with ID '${entityId}' was not found.`);
    }
    
    return result;
  };
  
  // Create a wrapper handler that uses standardized responses
  const standardizedHandler: Handler<T, McpResponse> = async (params: T): Promise<McpResponse> => {
    const result = await baseHandler(params);
    const requestDebug = params.debug; // No cast needed since T extends BaseParams
    const standardResponse = createStandardSuccessResponse(result, undefined, undefined, requestDebug);
    return createStandardMcpResponse(standardResponse);
  };

  // Apply middleware to the standardized handler
  return composeMiddleware(standardizedHandler, [
    // Apply debug tracking middleware
    (handler) => withDebugTracking({
      domain: options.domain,
      operation: 'retrieve',
      handlerName: enhancedErrorContext.handlerName || `${options.domain}.retrieve.${options.schemaName}`,
      schemaName: options.schemaName,
      entityType: entityName
    })(handler),
    // Apply error handling middleware
    (handler) => withErrorHandling(handler, enhancedErrorContext),
    // Apply schema validation middleware
    (handler) => withSchemaValidation(options.domain, options.schemaName, handler)
  ]);
}

/**
 * Creates a handler function for update operations
 */
export function createUpdateHandler<T extends BaseParams, R>(options: UpdateHandlerOptions<T, R>): Handler<unknown, McpResponse> {
  const { entityName, idParam, clientAction, successMessage } = options;
  
  // Create an enhanced error context
  const enhancedErrorContext: ErrorContext = {
    ...options.errorContext,
    handlerName: `${options.domain}.update.${options.schemaName}`,
    operation: 'update',
    resourceType: entityName
  };
  
  // Create the response transformer function
  const responseTransformer = (result: R, requestDebug?: boolean) => {
    // Safely extract ID if the result has one
    const entityId = (result && typeof result === 'object' && 'id' in result) 
      ? (result as { id: string | number }).id 
      : 'unknown';
    const message = successMessage 
      ? (typeof successMessage === 'function' ? successMessage(result) : successMessage)
      : `${entityName} ${entityId} was successfully updated.`;
      
    return createStandardSuccessResponse(result, message, undefined, requestDebug);
  };
  
  // Create and return the composed handler with dynamic resourceId
  return createBaseHandler(
    { ...options, errorContext: enhancedErrorContext },
    async (client, params, context) => {
      // Update error context with the resource ID
      enhancedErrorContext.resourceId = params[idParam] as string | number;
      return await clientAction(client, params, context);
    },
    responseTransformer
  );
}

/**
 * Creates a handler function for delete operations
 */
export function createDeleteHandler<T extends BaseParams>(options: DeleteHandlerOptions<T>): Handler<unknown, McpResponse> {
  const { entityName, idParam, clientAction, successMessage } = options;
  
  // Create an enhanced error context
  const enhancedErrorContext: ErrorContext = {
    ...options.errorContext,
    handlerName: `${options.domain}.delete.${options.schemaName}`,
    operation: 'delete',
    resourceType: entityName
  };
  
  // Create the response transformer function
  const responseTransformer = (_result: void, requestDebug?: boolean) => {
    const entityId = enhancedErrorContext.resourceId;
    const message = successMessage 
      ? (typeof successMessage === 'function' ? successMessage(entityId) : successMessage)
      : `${entityName} ${entityId} was successfully deleted.`;
      
    return createStandardSuccessResponse(null, message, undefined, requestDebug);
  };
  
  // Create and return the composed handler with dynamic resourceId
  return createBaseHandler(
    { ...options, errorContext: enhancedErrorContext },
    async (client, params, context) => {
      // Update error context with the resource ID
      enhancedErrorContext.resourceId = params[idParam] as string | number;
      await clientAction(client, params, context);
      return undefined;
    },
    responseTransformer
  );
}

/**
 * Creates a handler function for list operations
 */
export function createListHandler<T extends BaseParams, R>(options: ListHandlerOptions<T, R>): Handler<unknown, McpResponse> {
  const { entityName, clientAction, formatResult: _formatResult } = options;
  
  // Create an enhanced error context
  const enhancedErrorContext: ErrorContext = {
    ...options.errorContext,
    handlerName: `${options.domain}.list.${options.schemaName}`,
    operation: 'list',
    resourceType: `${entityName} list`
  };
  
  // Create the response transformer function
  const responseTransformer = (results: R[], requestDebug?: boolean) => {
    // For list handlers, we'll return standardized success response with the results
    return createStandardSuccessResponse(
      results, 
      `Found ${results.length} ${entityName}(s)`,
      undefined,
      requestDebug
    );
  };
  
  return createBaseHandler(
    { ...options, errorContext: enhancedErrorContext },
    clientAction,
    responseTransformer
  );
}

/**
 * Creates a custom handler with middleware
 * @param options Handler options
 * @param handler The base handler function
 * @returns A composed handler with validation and error handling
 */
export function createCustomHandler<T extends BaseParams, R>(
  options: BaseHandlerOptions<T>, 
  handler: Handler<T, R | McpResponse>
): Handler<unknown, McpResponse> {
  const { domain, schemaName, errorContext } = options;
  
  // Register the schema if it hasn't been registered yet
  SchemaRegistry.register(domain, schemaName, options.schema);
  
  // Apply middleware to the handler
  return composeMiddleware(handler, [
    // Apply debug tracking middleware
    (h) => withDebugTracking({
      domain,
      operation: errorContext?.operation || 'custom',
      handlerName: errorContext?.handlerName || `${domain}.custom.${schemaName}`,
      schemaName,
      entityType: errorContext?.resourceType
    })(h),
    // Apply error handling middleware
    (h) => withErrorHandling(h, errorContext),
    // Apply schema validation middleware
    (h) => withSchemaValidation(domain, schemaName, h)
  ]);
}

/**
 * Creates a handler registry for a domain, applying validation and error handling to all handlers
 * @param domain The domain area
 * @param schemas Map of schema name to schema
 * @param handlers Map of handler name to handler function
 * @param options Additional options for handler creation
 * @returns An object with validated and error-handled handlers
 */
export function createDomainHandlerRegistry<
  T extends Record<string, z.ZodType>,
  H extends { [K in keyof T]?: Handler<z.infer<T[K]>, any> }
>(
  domain: string,
  schemas: T,
  handlers: H,
  options: {
    errorContext?: Partial<ErrorContext>;
  } = {}
): { [K in keyof H]: Handler<unknown, McpResponse> } {
  // Register all schemas
  SchemaRegistry.registerBulk(domain, schemas);
  
  // Create validated and error-handled handlers
  const enhancedHandlers: Record<string, Handler<unknown, McpResponse>> = {};
  
  for (const [name, handler] of Object.entries(handlers)) {
    if (handler) {
      const schema = schemas[name];
      if (!schema) {
        throw new Error(`Schema not found for handler ${name} in domain ${domain}`);
      }
      
      // Create a specific error context for this handler
      const handlerErrorContext: ErrorContext = {
        ...options.errorContext,
        handlerName: `${domain}.${name}`
      };
      
      // Create a base handler options object
      const handlerOptions: BaseHandlerOptions<any> = {
        domain,
        schemaName: name,
        schema,
        errorContext: handlerErrorContext
      };
      
      // Create and add the handler with middleware
      enhancedHandlers[name] = createCustomHandler(handlerOptions, handler);
    }
  }
  
  return enhancedHandlers as { [K in keyof H]: Handler<unknown, McpResponse> };
}

export default {
  createCreateHandler,
  createRetrieveHandler,
  createUpdateHandler,
  createDeleteHandler,
  createListHandler,
  createCustomHandler,
  createDomainHandlerRegistry
};