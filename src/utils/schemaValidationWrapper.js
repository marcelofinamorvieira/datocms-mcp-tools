/**
 * @file schemaValidationWrapper.ts
 * @description Validation wrappers for standardizing schema validation across handlers
 */
import { SchemaRegistry } from "./schemaRegistry.js";
import { createErrorHandlerResponse } from "./responseHandlers.js";
/**
 * Higher-order function for validating handler input using registered schemas
 * @param domain The domain area (e.g., 'records', 'schema')
 * @param schemaName The schema name
 * @param handler The handler function that processes validated data
 * @returns A wrapped handler that validates input
 */
export function withSchemaValidation(domain, schemaName, handler) {
    return async (args) => {
        // Validate input against the registered schema
        const validationResult = SchemaRegistry.validate(domain, schemaName, args);
        if (!validationResult.success) {
            // Format validation errors for a better user experience
            const errorDetails = formatZodError(validationResult.error);
            return createErrorHandlerResponse(`Validation failed for ${domain}:${schemaName}. ${errorDetails.message}`, { validationErrors: errorDetails });
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
export function formatZodError(error) {
    // Format the error issues into a more readable structure
    const errors = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
    }));
    // Create a summary message
    const message = errors.length === 1
        ? `Error in field "${errors[0].path || 'input'}": ${errors[0].message}`
        : `Found ${errors.length} validation errors. First error: "${errors[0].message}"`;
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
export function registerValidatedHandlers(domain, handlerMap) {
    const validatedHandlers = {};
    for (const [schemaName, handler] of Object.entries(handlerMap)) {
        validatedHandlers[schemaName] = withSchemaValidation(domain, schemaName, handler);
    }
    return validatedHandlers;
}
/**
 * Creates a domain handler registry with validated handlers
 * @param domain The domain area
 * @param schemas The schema registry for the domain
 * @param handlers The handler implementations
 * @returns Object with validated handlers
 */
export function createDomainHandlers(domain, schemas, handlers) {
    // Register all schemas
    SchemaRegistry.registerBulk(domain, schemas);
    // Create validated handlers
    const validatedHandlers = {};
    for (const [name, handler] of Object.entries(handlers)) {
        if (handler) {
            validatedHandlers[name] = withSchemaValidation(domain, name, handler);
        }
    }
    return validatedHandlers;
}
export default {
    withSchemaValidation,
    registerValidatedHandlers,
    createDomainHandlers,
    formatZodError
};
