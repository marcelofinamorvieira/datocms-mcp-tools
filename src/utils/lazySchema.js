import { z } from "zod";
/**
 * Create a lazy-loaded schema
 * Initializes the schema only when first accessed
 *
 * @param schemaFactory Function that creates the schema
 * @returns A lazy-loaded schema
 */
export function lazy(schemaFactory) {
    let cachedSchema;
    // Create a function that initializes the schema on first use
    const lazySchema = (() => {
        if (!cachedSchema) {
            cachedSchema = schemaFactory();
        }
        return cachedSchema;
    });
    // Forward validation methods to the cached schema
    const zodAny = z.any();
    for (const method of Object.keys(zodAny)) {
        if (typeof zodAny[method] === 'function') {
            Object.defineProperty(lazySchema, method, {
                get() {
                    if (!cachedSchema) {
                        cachedSchema = schemaFactory();
                    }
                    // @ts-ignore
                    return cachedSchema[method].bind(cachedSchema);
                }
            });
        }
    }
    return lazySchema;
}
/**
 * Create a cached schema that initializes once and reuses
 *
 * @param schemaFactory Function that creates the schema
 * @returns A cached schema
 */
export function cachedSchema(schemaFactory) {
    let cached;
    return () => {
        if (!cached) {
            cached = schemaFactory();
        }
        return cached;
    };
}
/**
 * Create a registry of schemas that can be lazily loaded
 *
 * @param schemaFactories Record of schema factory functions
 * @returns A registry of lazy-loaded schemas
 */
export function createSchemaRegistry(schemaFactories) {
    const registry = {};
    for (const key in schemaFactories) {
        registry[key] = lazy(schemaFactories[key]);
    }
    return registry;
}
export default {
    lazy,
    cachedSchema,
    createSchemaRegistry
};
