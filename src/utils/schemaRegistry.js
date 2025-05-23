/**
 * @file schemaRegistry.ts
 * @description Centralized schema registry for standardized validation across the application
 */
import { z } from "zod";
import { lazy } from "./lazySchema.js";
import { errorMessages } from "./errorMessages.js";
import { apiTokenSchema, environmentSchema, paginationSchema, fieldTypeSchema } from "./sharedSchemas.js";
/**
 * Schema registry to centralize schema management, validation, and retrieval
 * Provides runtime schema access to enable dynamic validation and schema reuse
 */
export class SchemaRegistry {
    /**
     * Generates a full schema key from domain and name
     * @param domain The domain area (e.g., 'records', 'schema', 'uploads')
     * @param name The schema name within the domain
     * @returns A composite key using the domain and name
     */
    static getSchemaKey(domain, name) {
        return `${domain}:${name}`;
    }
    /**
     * Registers a schema with the registry
     * @param domain The domain area (e.g., 'records', 'schema', 'uploads')
     * @param name The schema name within the domain
     * @param schema The Zod schema to register
     * @param description Optional description of the schema's purpose
     */
    static register(domain, name, schema, description) {
        const key = this.getSchemaKey(domain, name);
        this.schemas.set(key, schema);
        if (description) {
            this.schemaDescriptions.set(key, description);
        }
    }
    /**
     * Registers multiple schemas at once for a domain
     * @param domain The domain area
     * @param schemaMap Object containing schema name to schema mappings
     */
    static registerBulk(domain, schemaMap) {
        for (const [name, schema] of Object.entries(schemaMap)) {
            this.register(domain, name, schema);
        }
    }
    /**
     * Retrieves a schema by its domain and name
     * @param domain The domain area
     * @param name The schema name within the domain
     * @returns The requested schema, or undefined if not found
     */
    static get(domain, name) {
        const key = this.getSchemaKey(domain, name);
        return this.schemas.get(key);
    }
    /**
     * Retrieves a schema by its full key
     * @param key The full schema key (domain:name)
     * @returns The requested schema, or undefined if not found
     */
    static getByKey(key) {
        return this.schemas.get(key);
    }
    /**
     * Checks if a schema exists in the registry
     * @param domain The domain area
     * @param name The schema name within the domain
     * @returns True if the schema exists, false otherwise
     */
    static has(domain, name) {
        const key = this.getSchemaKey(domain, name);
        return this.schemas.has(key);
    }
    /**
     * Removes a schema from the registry
     * @param domain The domain area
     * @param name The schema name within the domain
     * @returns True if the schema was removed, false if it didn't exist
     */
    static unregister(domain, name) {
        const key = this.getSchemaKey(domain, name);
        const descriptionRemoved = this.schemaDescriptions.delete(key);
        return this.schemas.delete(key);
    }
    /**
     * Gets a list of all registered schema keys
     * @returns Array of all schema keys in the format "domain:name"
     */
    static listSchemas() {
        return Array.from(this.schemas.keys());
    }
    /**
     * Gets a list of schema keys for a specific domain
     * @param domain The domain area to filter by
     * @returns Array of schema keys in the format "domain:name" for the specified domain
     */
    static listSchemasByDomain(domain) {
        return this.listSchemas().filter(key => key.startsWith(`${domain}:`));
    }
    /**
     * Gets a description for a schema if available
     * @param domain The domain area
     * @param name The schema name within the domain
     * @returns The schema description or undefined if not available
     */
    static getDescription(domain, name) {
        const key = this.getSchemaKey(domain, name);
        return this.schemaDescriptions.get(key);
    }
    /**
     * Validates data against a schema with standardized error handling
     * @param domain The domain area
     * @param name The schema name within the domain
     * @param data The data to validate
     * @returns A safe parse result with standardized error formatting
     */
    static validate(domain, name, data) {
        const schema = this.get(domain, name);
        if (!schema) {
            const error = new Error(`Schema not found: ${domain}:${name}`);
            return {
                success: false,
                error: new z.ZodError([{
                        code: z.ZodIssueCode.custom,
                        path: [],
                        message: error.message
                    }])
            };
        }
        // Parse the data
        const result = schema.safeParse(data);
        // Return successful results directly
        if (result.success) {
            return result;
        }
        // For error results, apply our formatting if enabled
        if (this.options.formatError) {
            // Format the errors in a more readable way
            const formattedErrors = result.error.format();
            const formattedResult = {
                success: false,
                error: result.error,
                formattedErrors
            };
            // Add description if available and option enabled
            if (this.options.addDescription) {
                const description = this.getDescription(domain, name);
                if (description) {
                    formattedResult.description = description;
                }
            }
            return formattedResult;
        }
        return result;
    }
    /**
     * Parses data against a schema with error handling
     * @param domain The domain area
     * @param name The schema name within the domain
     * @param data The data to validate
     * @returns The parsed data
     * @throws ZodError if validation fails
     */
    static parse(domain, name, data) {
        const schema = this.get(domain, name);
        if (!schema) {
            throw new Error(`Schema not found: ${domain}:${name}`);
        }
        return schema.parse(data);
    }
    /**
     * Creates a schema validation middleware/wrapper function
     * @param domain The domain area
     * @param name The schema name within the domain
     * @returns A validation function that handles schema parsing
     */
    static createValidator(domain, name) {
        return (data, next) => {
            const result = this.validate(domain, name, data);
            if (!result.success) {
                throw new Error(`Validation error for ${domain}:${name}: ${JSON.stringify(result.error.format())}`);
            }
            return next(result.data);
        };
    }
    /**
     * Sets validation error formatting options
     * @param options Options for error formatting
     */
    static setOptions(options) {
        this.options = { ...this.options, ...options };
    }
}
/** Map of registered schemas by domain and key */
SchemaRegistry.schemas = new Map();
/** Schema description cache */
SchemaRegistry.schemaDescriptions = new Map();
/** Schema validation error formatting options */
SchemaRegistry.options = {
    formatError: true,
    addDescription: true,
    wrapErrorResult: true
};
/**
 * Schema builder functions to standardize schema creation across the application
 */
export const SchemaBuilder = {
    /**
     * Creates a required string field
     * @param description Optional field description
     * @returns A Zod schema for a required string
     */
    requiredString: (description) => {
        const schema = z.string().min(1, { message: errorMessages.required });
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates an optional string field
     * @param description Optional field description
     * @returns A Zod schema for an optional string
     */
    optionalString: (description) => {
        const schema = z.string().optional();
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates a nullable string field
     * @param description Optional field description
     * @returns A Zod schema for a nullable string
     */
    nullableString: (description) => {
        const schema = z.string().nullable();
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates a required number field
     * @param options Optional validation options
     * @param description Optional field description
     * @returns A Zod schema for a required number
     */
    requiredNumber: (options, description) => {
        let schema = z.number();
        if (options?.integer) {
            schema = schema.int({ message: errorMessages.integer });
        }
        if (options?.min !== undefined) {
            schema = schema.min(options.min, { message: errorMessages.minValue(options.min) });
        }
        if (options?.max !== undefined) {
            schema = schema.max(options.max, { message: errorMessages.maxValue(options.max) });
        }
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates an optional number field
     * @param options Optional validation options
     * @param description Optional field description
     * @returns A Zod schema for an optional number
     */
    optionalNumber: (options, description) => {
        let schema = z.number();
        if (options?.integer) {
            schema = schema.int({ message: errorMessages.integer });
        }
        if (options?.min !== undefined) {
            schema = schema.min(options.min, { message: errorMessages.minValue(options.min) });
        }
        if (options?.max !== undefined) {
            schema = schema.max(options.max, { message: errorMessages.maxValue(options.max) });
        }
        return description ? schema.optional().describe(description) : schema.optional();
    },
    /**
     * Creates a required boolean field
     * @param description Optional field description
     * @returns A Zod schema for a required boolean
     */
    requiredBoolean: (description) => {
        const schema = z.boolean();
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates an optional boolean field
     * @param description Optional field description
     * @returns A Zod schema for an optional boolean
     */
    optionalBoolean: (description) => {
        const schema = z.boolean().optional();
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates a required array field
     * @param itemSchema Schema for array items
     * @param options Optional validation options
     * @param description Optional field description
     * @returns A Zod schema for a required array
     */
    requiredArray: (itemSchema, options, description) => {
        let schema = z.array(itemSchema);
        if (options?.min !== undefined) {
            schema = schema.min(options.min, { message: errorMessages.minItems(options.min) });
        }
        if (options?.max !== undefined) {
            schema = schema.max(options.max, { message: errorMessages.maxItems(options.max) });
        }
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates an optional array field
     * @param itemSchema Schema for array items
     * @param options Optional validation options
     * @param description Optional field description
     * @returns A Zod schema for an optional array
     */
    optionalArray: (itemSchema, options, description) => {
        let schema = z.array(itemSchema);
        if (options?.min !== undefined) {
            schema = schema.min(options.min, { message: errorMessages.minItems(options.min) });
        }
        if (options?.max !== undefined) {
            schema = schema.max(options.max, { message: errorMessages.maxItems(options.max) });
        }
        return description ? schema.optional().describe(description) : schema.optional();
    },
    /**
     * Creates a required object field
     * @param shape Object shape definition
     * @param description Optional field description
     * @returns A Zod schema for a required object
     */
    requiredObject: (shape, description) => {
        const schema = z.object(shape);
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates an optional object field
     * @param shape Object shape definition
     * @param description Optional field description
     * @returns A Zod schema for an optional object
     */
    optionalObject: (shape, description) => {
        const schema = z.object(shape).optional();
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates an enum field
     * @param values Array of enum values
     * @param description Optional field description
     * @returns A Zod enum schema
     */
    enum: (values, description) => {
        const schema = z.enum(values, {
            errorMap: () => ({
                message: errorMessages.enum(values)
            })
        });
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates an optional enum field
     * @param values Array of enum values
     * @param description Optional field description
     * @returns A Zod optional enum schema
     */
    optionalEnum: (values, description) => {
        const schema = z.enum(values, {
            errorMap: () => ({
                message: errorMessages.enum(values)
            })
        }).optional();
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates a date string field (YYYY-MM-DD)
     * @param description Optional field description
     * @returns A Zod schema for a date string
     */
    dateString: (description) => {
        const schema = z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, {
            message: errorMessages.invalidDate
        });
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates a datetime string field (ISO 8601)
     * @param description Optional field description
     * @returns A Zod schema for a datetime string
     */
    datetimeString: (description) => {
        const schema = z.string()
            .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/, {
            message: errorMessages.invalidDateTime
        });
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates a record field (dictionary/map)
     * @param valueSchema Schema for record values
     * @param description Optional field description
     * @returns A Zod schema for a record
     */
    record: (valueSchema, description) => {
        const schema = z.record(valueSchema);
        return description ? schema.describe(description) : schema;
    },
    /**
     * Creates an API key field with proper validation
     * @param description Optional field description
     * @returns A Zod schema for an API key
     */
    apiKey: (description) => {
        const schema = z.string().regex(/^[a-z][a-z0-9_]*$/, {
            message: errorMessages.apiKeyFormat
        });
        return description ? schema.describe(description) : schema;
    }
};
/**
 * Legacy registry for backward compatibility with existing code
 */
export const schemaRegistry = {
    // Base schemas
    apiToken: lazy(() => apiTokenSchema),
    environment: lazy(() => environmentSchema),
    confirmation: lazy(() => z.boolean().optional()),
    // ID schemas
    recordId: lazy(() => z.string().min(1).describe("The ID of the record to interact with.")),
    itemTypeId: lazy(() => z.string().min(1).describe("The ID of the item type to interact with.")),
    fieldId: lazy(() => z.string().min(1).describe("The ID of the field to interact with.")),
    fieldsetId: lazy(() => z.string().min(1).describe("The ID of the fieldset to interact with.")),
    environmentId: lazy(() => z.string().min(1).describe("The ID of the environment to interact with.")),
    webhookId: lazy(() => z.string().min(1).describe("The ID of the webhook to interact with.")),
    buildTriggerId: lazy(() => z.string().min(1).describe("The ID of the build trigger to interact with.")),
    collaboratorId: lazy(() => z.string().min(1).describe("The ID of the collaborator to interact with.")),
    tokenId: lazy(() => z.string().min(1).describe("The ID of the API token to interact with.")),
    uploadId: lazy(() => z.string().min(1).describe("The ID of the upload to interact with.")),
    // Pagination schemas
    pagination: lazy(() => paginationSchema),
    // Field type schema
    fieldType: lazy(() => fieldTypeSchema)
};
/**
 * Basic list schema with common parameters
 */
export const basicList = z.object({
    apiToken: schemaRegistry.apiToken,
    environment: schemaRegistry.environment,
    page: schemaRegistry.pagination.optional()
});
/**
 * Basic get schema with common parameters
 */
export const basicGet = z.object({
    apiToken: schemaRegistry.apiToken,
    environment: schemaRegistry.environment
});
/**
 * Basic delete schema with common parameters
 */
export const basicDelete = z.object({
    apiToken: schemaRegistry.apiToken,
    environment: schemaRegistry.environment
});
/**
 * Type-safe schema factory for creating schemas with consistent base
 */
export function createSchema(shape) {
    return z.object({
        apiToken: schemaRegistry.apiToken,
        environment: schemaRegistry.environment,
        ...shape
    });
}
/**
 * Domain-specific schema registries
 */
export const domainSchemas = {
    // Records domain
    records: {
        retrieve: lazy(() => createSchema({
            recordId: schemaRegistry.recordId
        })),
        delete: lazy(() => createSchema({
            recordId: schemaRegistry.recordId
        })),
        publish: lazy(() => createSchema({
            recordId: schemaRegistry.recordId
        })),
        unpublish: lazy(() => createSchema({
            recordId: schemaRegistry.recordId
        }))
    },
    // Schema domain
    schema: {
        itemType: {
            retrieve: lazy(() => createSchema({
                itemTypeId: schemaRegistry.itemTypeId
            })),
            delete: lazy(() => createSchema({
                itemTypeId: schemaRegistry.itemTypeId
            }))
        },
        field: {
            retrieve: lazy(() => createSchema({
                fieldId: schemaRegistry.fieldId
            })),
            delete: lazy(() => createSchema({
                fieldId: schemaRegistry.fieldId
            }))
        },
        fieldset: {
            retrieve: lazy(() => createSchema({
                fieldsetId: schemaRegistry.fieldsetId
            })),
            delete: lazy(() => createSchema({
                fieldsetId: schemaRegistry.fieldsetId
            }))
        }
    },
    // Environments domain
    environments: {
        retrieve: lazy(() => createSchema({
            environmentId: schemaRegistry.environmentId
        })),
        delete: lazy(() => createSchema({
            environmentId: schemaRegistry.environmentId
        })),
        promote: lazy(() => createSchema({
            environmentId: schemaRegistry.environmentId
        }))
    },
    // Webhooks domain
    webhooks: {
        retrieve: lazy(() => createSchema({
            webhookId: schemaRegistry.webhookId
        })),
        delete: lazy(() => createSchema({
            webhookId: schemaRegistry.webhookId
        }))
    },
    // Build triggers domain
    buildTriggers: {
        retrieve: lazy(() => createSchema({
            buildTriggerId: schemaRegistry.buildTriggerId
        })),
        delete: lazy(() => createSchema({
            buildTriggerId: schemaRegistry.buildTriggerId
        }))
    },
    // Collaborators domain
    collaborators: {
        retrieve: lazy(() => createSchema({
            collaboratorId: schemaRegistry.collaboratorId
        })),
        delete: lazy(() => createSchema({
            collaboratorId: schemaRegistry.collaboratorId
        }))
    },
    // API tokens domain
    tokens: {
        retrieve: lazy(() => createSchema({
            tokenId: schemaRegistry.tokenId
        })),
        delete: lazy(() => createSchema({
            tokenId: schemaRegistry.tokenId
        }))
    },
    // Uploads domain
    uploads: {
        retrieve: lazy(() => createSchema({
            uploadId: schemaRegistry.uploadId
        })),
        delete: lazy(() => createSchema({
            uploadId: schemaRegistry.uploadId
        }))
    }
};
export default {
    SchemaRegistry,
    SchemaBuilder,
    schemaRegistry,
    basicList,
    basicGet,
    basicDelete,
    createSchema,
    domainSchemas
};
