/**
 * @file handlerFactories.ts
 * @description Factory functions for creating common handler patterns with proper type handling
 * @module utils
 */

import type { z } from "zod";
import { getClient } from "./clientManager.js";
import { createResponse } from "./responseHandlers.js";
import { 
  isAuthorizationError, 
  isNotFoundError, 
  createErrorResponse, 
  extractDetailedErrorInfo 
} from "./errorHandlers.js";

/**
 * Type for a generic DatoCMS client
 */
type DatoCMSClient = ReturnType<typeof getClient>;

/**
 * Type for a function that creates a client response object
 */
type ClientActionFn<T, R> = (client: DatoCMSClient, params: T) => Promise<R>;

/**
 * Options for create operation handler
 */
interface CreateHandlerOptions<T, R> {
  /** Schema for validation */
  schema: z.ZodType<T>;
  /** Message to display on successful creation */
  successMessage: string | ((result: R) => string);
  /** Custom client action function */
  clientAction: ClientActionFn<T, R>;
}

/**
 * Options for retrieve operation handler
 */
interface RetrieveHandlerOptions<T, R> {
  /** Schema for validation */
  schema: z.ZodType<T>;
  /** Entity name for error messages */
  entityName: string;
  /** ID parameter name in the params object */
  idParam: keyof T;
  /** Custom client action function */
  clientAction: ClientActionFn<T, R>;
}

/**
 * Options for delete operation handler
 */
interface DeleteHandlerOptions<T> {
  /** Schema for validation */
  schema: z.ZodType<T>;
  /** Entity name for error messages */
  entityName: string;
  /** ID parameter name in the params object */
  idParam: keyof T;
  /** Custom client action function */
  clientAction: ClientActionFn<T, void>;
}

/**
 * Options for list operation handler
 */
interface ListHandlerOptions<T, R> {
  /** Schema for validation */
  schema: z.ZodType<T>;
  /** Entity name for error messages */
  entityName: string;
  /** Custom client action function */
  clientAction: ClientActionFn<T, R[]>;
  /** Optional formatter for results */
  formatResult?: (results: R[]) => any;
}

/**
 * Creates a handler function for create operations
 */
export function createCreateHandler<T, R>(options: CreateHandlerOptions<T, R>) {
  const { schema, successMessage, clientAction } = options;
  
  return async (args: z.infer<typeof schema>) => {
    try {
      // We know these properties should exist in args based on our schema patterns
      const apiToken = (args as any).apiToken;
      const environment = (args as any).environment;
      
      // Initialize DatoCMS client
      const client = getClient(apiToken, environment);
      
      try {
        // Execute the client action
        const result = await clientAction(client, args);
        
        // Generate success message
        const message = typeof successMessage === 'function' 
          ? successMessage(result)
          : successMessage;
        
        // Return success response
        return createResponse(JSON.stringify({
          success: true,
          data: result,
          message
        }, null, 2));
        
      } catch (apiError: unknown) {
        if (isAuthorizationError(apiError)) {
          return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
        }
        
        // Re-throw other API errors to be caught by the outer catch
        throw apiError;
      }
    } catch (error: unknown) {
      return createErrorResponse(`Error creating entity: ${extractDetailedErrorInfo(error)}`);
    }
  };
}

/**
 * Creates a handler function for retrieve operations
 */
export function createRetrieveHandler<T, R>(options: RetrieveHandlerOptions<T, R>) {
  const { schema, entityName, idParam, clientAction } = options;
  
  return async (args: z.infer<typeof schema>) => {
    try {
      // We know these properties should exist in args based on our schema patterns
      const apiToken = (args as any).apiToken;
      const environment = (args as any).environment;
      const entityId = args[idParam];
      
      // Initialize DatoCMS client
      const client = getClient(apiToken, environment);
      
      try {
        // Execute the client action
        const result = await clientAction(client, args);
        
        // Check if entity was found
        if (!result) {
          return createErrorResponse(`Error: ${entityName} with ID '${entityId}' was not found.`);
        }
        
        // Return success response
        return createResponse(JSON.stringify(result, null, 2));
        
      } catch (apiError: unknown) {
        if (isAuthorizationError(apiError)) {
          return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
        }
        
        if (isNotFoundError(apiError)) {
          return createErrorResponse(`Error: ${entityName} with ID '${entityId}' was not found.`);
        }
        
        // Re-throw other API errors to be caught by the outer catch
        throw apiError;
      }
    } catch (error: unknown) {
      return createErrorResponse(`Error retrieving ${entityName}: ${extractDetailedErrorInfo(error)}`);
    }
  };
}

/**
 * Creates a handler function for update operations
 */
export function createUpdateHandler<T, R>(options: RetrieveHandlerOptions<T, R>) {
  const { schema, entityName, idParam, clientAction } = options;
  
  return async (args: z.infer<typeof schema>) => {
    try {
      // We know these properties should exist in args based on our schema patterns
      const apiToken = (args as any).apiToken;
      const environment = (args as any).environment;
      const entityId = args[idParam];
      
      // Initialize DatoCMS client
      const client = getClient(apiToken, environment);
      
      try {
        // Execute the client action
        const result = await clientAction(client, args);
        
        // Return success response
        return createResponse(JSON.stringify({
          success: true,
          data: result,
          message: `${entityName} ${entityId} was successfully updated.`
        }, null, 2));
        
      } catch (apiError: unknown) {
        if (isAuthorizationError(apiError)) {
          return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
        }
        
        if (isNotFoundError(apiError)) {
          return createErrorResponse(`Error: ${entityName} with ID '${entityId}' was not found.`);
        }
        
        // Re-throw other API errors to be caught by the outer catch
        throw apiError;
      }
    } catch (error: unknown) {
      return createErrorResponse(`Error updating ${entityName}: ${extractDetailedErrorInfo(error)}`);
    }
  };
}

/**
 * Creates a handler function for delete operations
 */
export function createDeleteHandler<T>(options: DeleteHandlerOptions<T>) {
  const { schema, entityName, idParam, clientAction } = options;
  
  return async (args: z.infer<typeof schema>) => {
    try {
      // Extract parameters
      const apiToken = (args as any).apiToken;
      const environment = (args as any).environment;
      const entityId = args[idParam];
      
      // Initialize DatoCMS client
      const client = getClient(apiToken, environment);
      
      try {
        // Execute the client action
        await clientAction(client, args);
        
        // Return success response
        return createResponse(JSON.stringify({
          success: true,
          message: `${entityName} ${entityId} was successfully deleted.`
        }, null, 2));
        
      } catch (apiError: unknown) {
        if (isAuthorizationError(apiError)) {
          return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
        }
        
        if (isNotFoundError(apiError)) {
          return createErrorResponse(`Error: ${entityName} with ID '${entityId}' was not found.`);
        }
        
        // Re-throw other API errors to be caught by the outer catch
        throw apiError;
      }
    } catch (error: unknown) {
      return createErrorResponse(`Error deleting ${entityName}: ${extractDetailedErrorInfo(error)}`);
    }
  };
}

/**
 * Creates a handler function for list operations with pagination
 */
export function createListHandler<T, R>(options: ListHandlerOptions<T, R>) {
  const { schema, entityName, clientAction, formatResult } = options;
  
  return async (args: z.infer<typeof schema>) => {
    try {
      // We know these properties should exist in args based on our schema patterns
      const apiToken = (args as any).apiToken;
      const environment = (args as any).environment;
      
      // Initialize DatoCMS client
      const client = getClient(apiToken, environment);
      
      try {
        // Execute the client action
        const results = await clientAction(client, args);
        
        // Format results if formatter provided
        const formattedResults = formatResult ? formatResult(results) : results;
        
        // Return success response
        return createResponse(JSON.stringify(formattedResults, null, 2));
        
      } catch (apiError: unknown) {
        if (isAuthorizationError(apiError)) {
          return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
        }
        
        // Re-throw other API errors to be caught by the outer catch
        throw apiError;
      }
    } catch (error: unknown) {
      return createErrorResponse(`Error listing ${entityName}s: ${extractDetailedErrorInfo(error)}`);
    }
  };
}