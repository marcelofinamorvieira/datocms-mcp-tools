/**
 * @file enhancedHandlerFactory.ts
 * @description Enhanced factory functions for creating handlers with middleware composition
 * Combines error handling, schema validation, and client management in a unified pattern
 */
import { createResponse } from "./responseHandlers.js";
import { UnifiedClientManager, ClientType } from "./unifiedClientManager.js";
import { withErrorHandling } from "./errorHandlerWrapper.js";
import { withSchemaValidation } from "./schemaValidationWrapper.js";
import { SchemaRegistry } from "./schemaRegistry.js";
import { withDebugTracking } from "./debugMiddleware.js";
/**
 * Function composition to apply a series of higher-order functions to a base handler
 * @param baseHandler The base handler function
 * @param middleware Array of higher-order functions to apply
 * @returns The composed handler with all middleware applied
 */
function composeMiddleware(baseHandler, middleware) {
    // Apply middleware from right to left (last middleware runs first)
    return middleware.reduceRight((handler, applyMiddleware) => applyMiddleware(handler), baseHandler);
}
/**
 * Creates a handler with error handling, schema validation, and client management
 * @param options Base handler options
 * @param clientAction Function to execute with the client
 * @param responseTransformer Function to transform the result into a response
 * @returns A fully composed handler with validation and error handling
 */
function createBaseHandler(options, clientAction, responseTransformer) {
    const { domain, schemaName, schema, errorContext, clientType = ClientType.DEFAULT } = options;
    // Register the schema if it hasn't been registered yet
    SchemaRegistry.register(domain, schemaName, schema);
    // Define the base handler function
    const baseHandler = async (params) => {
        // Extract client parameters
        const apiToken = params.apiToken;
        const environment = params.environment;
        // Get the appropriate client
        let client;
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
export function createCreateHandler(options) {
    const { successMessage, clientAction, errorContext } = options;
    // Create an enhanced error context
    const enhancedErrorContext = {
        ...errorContext,
        handlerName: `${options.domain}.create.${options.schemaName}`,
        operation: 'create',
        resourceType: options.entityName || 'resource'
    };
    // Create the response transformer function
    const responseTransformer = (result) => ({
        success: true,
        data: result,
        message: typeof successMessage === 'function' ? successMessage(result) : successMessage
    });
    // Use a simpler approach - fix the issue in the actual handler instead
    return createBaseHandler({ ...options, errorContext: enhancedErrorContext }, clientAction, 
    // Just use the results directly
    (results) => results);
}
/**
 * Creates a handler function for retrieve operations
 */
export function createRetrieveHandler(options) {
    const { entityName, idParam, clientAction } = options;
    // Create an enhanced error context
    const enhancedErrorContext = {
        ...options.errorContext,
        handlerName: `${options.domain}.retrieve.${options.schemaName}`,
        operation: 'retrieve',
        resourceType: entityName
    };
    // Create the base handler with dynamic resourceId added to error context
    const baseHandler = async (params) => {
        const entityId = params[idParam];
        // Update error context with the resource ID
        enhancedErrorContext.resourceId = entityId;
        // Extract client parameters
        const apiToken = params.apiToken;
        const environment = params.environment;
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
        (handler) => async (args) => createResponse(JSON.stringify(await handler(args), null, 2)),
        // Apply error handling middleware
        (handler) => withErrorHandling(handler, enhancedErrorContext),
        // Apply schema validation middleware
        (handler) => withSchemaValidation(options.domain, options.schemaName, handler)
    ]);
}
/**
 * Creates a handler function for update operations
 */
export function createUpdateHandler(options) {
    const { entityName, idParam, clientAction, successMessage } = options;
    // Create an enhanced error context
    const enhancedErrorContext = {
        ...options.errorContext,
        handlerName: `${options.domain}.update.${options.schemaName}`,
        operation: 'update',
        resourceType: entityName
    };
    // Create the response transformer function
    const responseTransformer = (result) => {
        const entityId = result.id || 'unknown';
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
    return createBaseHandler({ ...options, errorContext: enhancedErrorContext }, async (client, params) => {
        // Update error context with the resource ID
        enhancedErrorContext.resourceId = params[idParam];
        return await clientAction(client, params);
    }, responseTransformer);
}
/**
 * Creates a handler function for delete operations
 */
export function createDeleteHandler(options) {
    const { entityName, idParam, clientAction, successMessage } = options;
    // Create an enhanced error context
    const enhancedErrorContext = {
        ...options.errorContext,
        handlerName: `${options.domain}.delete.${options.schemaName}`,
        operation: 'delete',
        resourceType: entityName
    };
    // Create the response transformer function
    const responseTransformer = (result) => {
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
    return createBaseHandler({ ...options, errorContext: enhancedErrorContext }, async (client, params) => {
        // Update error context with the resource ID
        enhancedErrorContext.resourceId = params[idParam];
        await clientAction(client, params);
        return undefined;
    }, responseTransformer);
}
/**
 * Creates a handler function for list operations
 */
export function createListHandler(options) {
    const { entityName, clientAction, formatResult } = options;
    // Create an enhanced error context
    const enhancedErrorContext = {
        ...options.errorContext,
        handlerName: `${options.domain}.list.${options.schemaName}`,
        operation: 'list',
        resourceType: `${entityName} list`
    };
    // Create the response transformer function
    const responseTransformer = (data) => formatResult ? formatResult(data.results, data.params) : data.results;
    // Use a simpler approach - fix the issue in the actual handler instead
    return createBaseHandler({ ...options, errorContext: enhancedErrorContext }, clientAction, 
    // Just use the results directly
    (results) => results);
}
/**
 * Creates a custom handler with middleware
 * @param options Handler options
 * @param handler The base handler function
 * @returns A composed handler with validation and error handling
 */
export function createCustomHandler(options, handler) {
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
export function createDomainHandlerRegistry(domain, schemas, handlers, options = {}) {
    // Register all schemas
    SchemaRegistry.registerBulk(domain, schemas);
    // Create validated and error-handled handlers
    const enhancedHandlers = {};
    for (const [name, handler] of Object.entries(handlers)) {
        if (handler) {
            const schema = schemas[name];
            if (!schema) {
                throw new Error(`Schema not found for handler ${name} in domain ${domain}`);
            }
            // Create a specific error context for this handler
            const handlerErrorContext = {
                ...options.errorContext,
                handlerName: `${domain}.${name}`
            };
            // Create a base handler options object
            const handlerOptions = {
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
    return enhancedHandlers;
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
