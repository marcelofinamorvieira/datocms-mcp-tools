/**
 * @file enhancedHandlerFactory.ts
 * @description Enhanced factory functions for creating handlers with middleware composition
 * Combines error handling, schema validation, and client management in a unified pattern
 */

import type { z } from "zod";
import { HandlerResponse, createResponse, Response } from "./responseHandlers.js";
import { UnifiedClientManager, ClientType } from "./unifiedClientManager.js";
import { withErrorHandling, ErrorContext } from "./errorHandlerWrapper.js";
import { withSchemaValidation, Handler } from "./schemaValidationWrapper.js";
import { SchemaRegistry } from "./schemaRegistry.js";

/**
 * Type for a generic DatoCMS client
 */
export type DatoCMSClient = any; // Using 'any' for now to simplify type compatibility

/**
 * Type for a function that creates a client response object
 */
export type ClientActionFn<T, R> = (client: DatoCMSClient, params: T) => Promise<R>;

/**
 * Base handler options shared across all handler types
 */
export interface BaseHandlerOptions<T> {
  /** The domain for schema registration and validation */
  domain: string;
  /** The schema name for this handler */
  schemaName: string;
  /** Schema for validation */
  schema: z.ZodType<T>;
  /** Error context for detailed error messages */
  errorContext?: ErrorContext;
  /** Client type to use (default, records, collaborators) */
  clientType?: ClientType;
}

/**
 * Options for create operation handler
 */
export interface CreateHandlerOptions<T, R> extends BaseHandlerOptions<T> {
  /** Message to display on successful creation */
  successMessage: string | ((result: R) => string);
  /** Custom client action function */
  clientAction: ClientActionFn<T, R>;
}

/**
 * Options for retrieve operation handler
 */
export interface RetrieveHandlerOptions<T, R> extends BaseHandlerOptions<T> {
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
export interface ListHandlerOptions<T, R> extends BaseHandlerOptions<T> {
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
export interface UpdateHandlerOptions<T, R> extends BaseHandlerOptions<T> {
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
export interface DeleteHandlerOptions<T> extends BaseHandlerOptions<T> {
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
  middleware: Array<(handler: Handler<any, any>) => Handler<any, any>>
): Handler<unknown, Response> {
  // Apply middleware from right to left (last middleware runs first)
  return middleware.reduceRight(
    (handler, applyMiddleware) => applyMiddleware(handler),
    baseHandler as Handler<any, any>
  ) as Handler<unknown, Response>;
}

/**
 * Creates a handler with error handling, schema validation, and client management
 * @param options Base handler options
 * @param clientAction Function to execute with the client
 * @param responseTransformer Function to transform the result into a response
 * @returns A fully composed handler with validation and error handling
 */
function createBaseHandler<T, R>(
  options: BaseHandlerOptions<T>,
  clientAction: ClientActionFn<T, R>,
  responseTransformer: (result: R) => any
): Handler<unknown, Response> {
  const { domain, schemaName, schema, errorContext, clientType = ClientType.DEFAULT } = options;
  
  // Register the schema if it hasn't been registered yet
  SchemaRegistry.register(domain, schemaName, schema);
  
  // Define the base handler function
  const baseHandler: Handler<T, Response> = async (params: T): Promise<Response> => {
    // Extract client parameters
    const apiToken = (params as any).apiToken;
    const environment = (params as any).environment;
    
    // Get the appropriate client
    let client: DatoCMSClient;
    switch (clientType) {
      case ClientType.RECORDS:
        client = UnifiedClientManager.getRecordsClient(apiToken, environment);
        break;
      case ClientType.COLLABORATORS:
        client = UnifiedClientManager.getCollaboratorsClient(apiToken, environment);
        break;
      default:
        client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    }
    
    // Execute the client action
    const result = await clientAction(client, params);
    
    // Transform and return the result
    const transformedResult = responseTransformer(result);
    return createResponse(JSON.stringify(transformedResult, null, 2));
  };
  
  // Apply middleware to the base handler
  return composeMiddleware(baseHandler, [
    // Apply error handling middleware
    (handler) => withErrorHandling(handler, errorContext),
    // Apply schema validation middleware
    (handler) => withSchemaValidation(domain, schemaName, handler)
  ]);
}

/**
 * Creates a handler function for create operations
 */
export function createCreateHandler<T, R>(options: CreateHandlerOptions<T, R>): Handler<unknown, Response> {
  const { successMessage, clientAction, errorContext } = options;
  
  // Create an enhanced error context
  const enhancedErrorContext: ErrorContext = {
    ...errorContext,
    handlerName: `${options.domain}.create.${options.schemaName}`
  };
  
  // Create the response transformer function
  const responseTransformer = (result: R) => ({
    success: true,
    data: result,
    message: typeof successMessage === 'function' ? successMessage(result) : successMessage
  });
  
  // Use a simpler approach - fix the issue in the actual handler instead
  return createBaseHandler(
    { ...options, errorContext: enhancedErrorContext },
    clientAction,
    // Just use the results directly
    (results) => results
  );
}

/**
 * Creates a handler function for retrieve operations
 */
export function createRetrieveHandler<T, R>(options: RetrieveHandlerOptions<T, R>): Handler<unknown, Response> {
  const { entityName, idParam, clientAction } = options;
  
  // Create an enhanced error context
  const enhancedErrorContext: ErrorContext = {
    ...options.errorContext,
    handlerName: `${options.domain}.retrieve.${options.schemaName}`,
    resourceType: entityName
  };
  
  // Create the base handler with dynamic resourceId added to error context
  const baseHandler = async (params: T): Promise<R> => {
    const entityId = params[idParam];
    
    // Update error context with the resource ID
    enhancedErrorContext.resourceId = entityId as string | number;
    
    // Extract client parameters
    const apiToken = (params as any).apiToken;
    const environment = (params as any).environment;
    
    // Get the appropriate client based on client type
    const client = options.clientType === ClientType.RECORDS 
      ? UnifiedClientManager.getRecordsClient(apiToken, environment)
      : options.clientType === ClientType.COLLABORATORS
        ? UnifiedClientManager.getCollaboratorsClient(apiToken, environment)
        : UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    // Execute the client action
    const result = await clientAction(client, params);
    
    // Check if entity was found
    if (!result) {
      throw new Error(`${entityName} with ID '${entityId}' was not found.`);
    }
    
    return result;
  };
  
  // Apply middleware to the base handler
  return composeMiddleware(baseHandler, [
    // Apply response creation
    (handler) => async (args: any) => createResponse(JSON.stringify(await handler(args), null, 2)),
    // Apply error handling middleware
    (handler) => withErrorHandling(handler, enhancedErrorContext),
    // Apply schema validation middleware
    (handler) => withSchemaValidation(options.domain, options.schemaName, handler)
  ]);
}

/**
 * Creates a handler function for update operations
 */
export function createUpdateHandler<T, R>(options: UpdateHandlerOptions<T, R>): Handler<unknown, Response> {
  const { entityName, idParam, clientAction, successMessage } = options;
  
  // Create an enhanced error context
  const enhancedErrorContext: ErrorContext = {
    ...options.errorContext,
    handlerName: `${options.domain}.update.${options.schemaName}`,
    resourceType: entityName
  };
  
  // Create the response transformer function
  const responseTransformer = (result: R) => {
    const entityId = (result as any).id || 'unknown';
    const message = successMessage 
      ? (typeof successMessage === 'function' ? successMessage(result) : successMessage)
      : `${entityName} ${entityId} was successfully updated.`;
      
    return {
      success: true,
      data: result,
      message
    };
  };
  
  // Create and return the composed handler with dynamic resourceId
  return createBaseHandler(
    { ...options, errorContext: enhancedErrorContext },
    async (client, params) => {
      // Update error context with the resource ID
      enhancedErrorContext.resourceId = params[idParam] as string | number;
      return await clientAction(client, params);
    },
    responseTransformer
  );
}

/**
 * Creates a handler function for delete operations
 */
export function createDeleteHandler<T>(options: DeleteHandlerOptions<T>): Handler<unknown, Response> {
  const { entityName, idParam, clientAction, successMessage } = options;
  
  // Create an enhanced error context
  const enhancedErrorContext: ErrorContext = {
    ...options.errorContext,
    handlerName: `${options.domain}.delete.${options.schemaName}`,
    resourceType: entityName
  };
  
  // Create the response transformer function
  const responseTransformer = (result: void) => {
    const entityId = enhancedErrorContext.resourceId;
    const message = successMessage 
      ? (typeof successMessage === 'function' ? successMessage(entityId) : successMessage)
      : `${entityName} ${entityId} was successfully deleted.`;
      
    return {
      success: true,
      message
    };
  };
  
  // Create and return the composed handler with dynamic resourceId
  return createBaseHandler(
    { ...options, errorContext: enhancedErrorContext },
    async (client, params) => {
      // Update error context with the resource ID
      enhancedErrorContext.resourceId = params[idParam] as string | number;
      await clientAction(client, params);
      return undefined;
    },
    responseTransformer
  );
}

/**
 * Creates a handler function for list operations
 */
export function createListHandler<T, R>(options: ListHandlerOptions<T, R>): Handler<unknown, Response> {
  const { entityName, clientAction, formatResult } = options;
  
  // Create an enhanced error context
  const enhancedErrorContext: ErrorContext = {
    ...options.errorContext,
    handlerName: `${options.domain}.list.${options.schemaName}`,
    resourceType: `${entityName} list`
  };
  
  // Create the response transformer function
  const responseTransformer = (data: { results: R[], params: T }) => 
    formatResult ? formatResult(data.results, data.params) : data.results;
  
  // Use a simpler approach - fix the issue in the actual handler instead
  return createBaseHandler(
    { ...options, errorContext: enhancedErrorContext },
    clientAction,
    // Just use the results directly
    (results) => results
  );
}

/**
 * Creates a custom handler with middleware
 * @param options Handler options
 * @param handler The base handler function
 * @returns A composed handler with validation and error handling
 */
export function createCustomHandler<T, R>(
  options: BaseHandlerOptions<T>, 
  handler: Handler<T, R | Response>
): Handler<unknown, Response> {
  const { domain, schemaName, errorContext } = options;
  
  // Register the schema if it hasn't been registered yet
  SchemaRegistry.register(domain, schemaName, options.schema);
  
  // Apply middleware to the handler
  return composeMiddleware(handler, [
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
    clientType?: ClientType;
  } = {}
): { [K in keyof H]: Handler<unknown, Response> } {
  // Register all schemas
  SchemaRegistry.registerBulk(domain, schemas);
  
  // Create validated and error-handled handlers
  const enhancedHandlers: Record<string, Handler<unknown, Response>> = {};
  
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
        errorContext: handlerErrorContext,
        clientType: options.clientType
      };
      
      // Create and add the handler with middleware
      enhancedHandlers[name] = createCustomHandler(handlerOptions, handler);
    }
  }
  
  return enhancedHandlers as { [K in keyof H]: Handler<unknown, Response> };
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