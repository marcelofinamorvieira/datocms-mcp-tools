import { z } from "zod";

/**
 * Lazy schema loading utilities for DatoCMS MCP server
 * 
 * These utilities help improve performance by deferring schema validation
 * initialization until needed, especially for large schema definitions.
 */

/**
 * LazySchema type for type-safe lazy schema loading
 */
export interface LazySchema<T extends z.ZodType> {
  (): T;
  _def: T;
}

/**
 * Create a lazy-loaded schema
 * Initializes the schema only when first accessed
 * 
 * @param schemaFactory Function that creates the schema
 * @returns A lazy-loaded schema
 */
export function lazy<T extends z.ZodType>(schemaFactory: () => T): T {
  let cachedSchema: T | undefined;
  
  // Create a function that initializes the schema on first use
  const lazySchema = (() => {
    if (!cachedSchema) {
      cachedSchema = schemaFactory();
    }
    return cachedSchema;
  }) as unknown as T;
  
  // Forward validation methods to the cached schema
  const zodAny = z.any();
  for (const method of Object.keys(zodAny)) {
    if (typeof zodAny[method as keyof typeof zodAny] === 'function') {
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
export function cachedSchema<T extends z.ZodType>(schemaFactory: () => T): () => T {
  let cached: T | undefined;
  
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
export function createSchemaRegistry<T extends Record<string, () => z.ZodType>>(
  schemaFactories: T
): { [K in keyof T]: ReturnType<T[K]> } {
  const registry = {} as { [K in keyof T]: ReturnType<T[K]> };
  
  for (const key in schemaFactories) {
    registry[key] = lazy(schemaFactories[key]) as unknown as ReturnType<T[typeof key]>;
  }
  
  return registry;
}

export default {
  lazy,
  cachedSchema,
  createSchemaRegistry
};