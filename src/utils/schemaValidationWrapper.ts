/**
 * @file schemaValidationWrapper.ts
 * @description Validation wrappers for standardizing schema validation across handlers
 */

import { z } from "zod";
import { SchemaRegistry } from "./schemaRegistry.js";
import { HandlerResponse, createErrorHandlerResponse, createResponse, Response } from "./responseHandlers.js";

/**
 * Handler function type
 */
export type Handler<T, R> = (args: T) => Promise<R>;

/**
 * Error info type for structured error formatting
 */
export interface ValidationErrorInfo {
  message: string;
  errors: Array<{ path: string; message: string }>;
}

/**
 * Higher-order function for validating handler input using registered schemas
 * @param domain The domain area (e.g., 'records', 'schema')
 * @param schemaName The schema name
 * @param handler The handler function that processes validated data
 * @returns A wrapped handler that validates input
 */
export function withSchemaValidation<T>(
  domain: string,
  schemaName: string,
  handler: Handler<T, Response>
): Handler<unknown, Response> {
  return async (args: unknown): Promise<Response> => {
    // Validate input against the registered schema
    const validationResult = SchemaRegistry.validate<T>(domain, schemaName, args);
    
    if (!validationResult.success) {
      // Format validation errors for a better user experience
      const errorDetails = formatZodError(validationResult.error);
      
      // Return a proper Response for validation errors
      const errorResponse = createErrorHandlerResponse(
        `Validation failed for ${domain}:${schemaName}. ${errorDetails.message}`,
        { validationErrors: errorDetails }
      );
      return createResponse(JSON.stringify(errorResponse, null, 2));
    }
    
    // Pass validated data to the handler
    return await handler(validationResult.data);
  };
}

/**
 * Formats a Zod error to a user-friendly format
 * @param error The Zod error to format
 * @returns A structured error object with details
 */
export function formatZodError(error: z.ZodError): ValidationErrorInfo {
  // Format the error issues into a more readable structure
  const errors = error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message
  }));
  
  // Create a summary message
  const message = errors.length === 1
    ? `Error in field "${errors[0]?.path || 'input'}": ${errors[0]?.message}`
    : errors.length > 0
    ? `Found ${errors.length} validation errors. First error: "${errors[0]?.message}"`
    : "Validation error";
  
  return {
    message,
    errors
  };
}

/**
 * Registers handlers with their schemas
 * @param domain The domain area
 * @param handlerMap Object mapping schema names to handler functions
 * @returns Object with validated handlers
 */
export function registerValidatedHandlers<T extends Record<string, Handler<any, any>>>(
  domain: string,
  handlerMap: T
): { [K in keyof T]: Handler<unknown, ReturnType<T[K]> | HandlerResponse<unknown>> } {
  const validatedHandlers: Record<string, Handler<unknown, any>> = {};
  
  for (const [schemaName, handler] of Object.entries(handlerMap)) {
    validatedHandlers[schemaName] = withSchemaValidation(domain, schemaName, handler);
  }
  
  return validatedHandlers as { [K in keyof T]: Handler<unknown, ReturnType<T[K]> | HandlerResponse<unknown>> };
}

/**
 * Creates a domain handler registry with validated handlers
 * @param domain The domain area
 * @param schemas The schema registry for the domain
 * @param handlers The handler implementations
 * @returns Object with validated handlers
 */
export function createDomainHandlers<
  T extends Record<string, z.ZodType>,
  H extends { [K in keyof T]?: Handler<z.infer<T[K]>, any> }
>(
  domain: string,
  schemas: T,
  handlers: H
): { [K in keyof H]: Handler<unknown, ReturnType<NonNullable<H[K]>> | HandlerResponse<unknown>> } {
  // Register all schemas
  SchemaRegistry.registerBulk(domain, schemas);
  
  // Create validated handlers
  const validatedHandlers: Record<string, Handler<unknown, any>> = {};
  
  for (const [name, handler] of Object.entries(handlers)) {
    if (handler) {
      validatedHandlers[name] = withSchemaValidation(domain, name, handler);
    }
  }
  
  return validatedHandlers as { [K in keyof H]: Handler<unknown, ReturnType<NonNullable<H[K]>> | HandlerResponse<unknown>> };
}

export default {
  withSchemaValidation,
  registerValidatedHandlers,
  createDomainHandlers,
  formatZodError
};