import { z } from "zod";

/**
 * Advanced filter condition schema for DatoCMS records
 * 
 * This schema provides strict typing for field filters in record queries,
 * supporting all filter operators available in the DatoCMS API.
 * 
 * See: https://www.datocms.com/docs/content-delivery-api/filtering-records
 */

/**
 * Base types that can be used in most filter conditions
 */
const filterableValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
]);

/**
 * Numeric values only (for comparison operators)
 */
const numericValue = z.union([
  z.string(), // String is allowed for dates and similar values
  z.number()
]);

/**
 * Array of filterable values (for in/nin operators)
 */
const filterableArray = z.array(
  z.union([z.string(), z.number()])
).min(1);

/**
 * Comprehensive filter condition schema with all supported operators
 */
export const filterCondition = z.union([
  // Equality operators
  z.object({ 
    eq: filterableValue
  }).describe("Equal to the specified value"),
  
  z.object({ 
    neq: filterableValue 
  }).describe("Not equal to the specified value"),
  
  // String matching with 'matches' for precise string matching
  // Note: This is supported but should be used carefully based on DatoCMS API limitations
  z.object({ 
    matches: z.string() 
  }).describe("Matches the specified string exactly (DatoCMS API support may vary)"),
  
  // Array inclusion operators
  z.object({ 
    in: filterableArray
  }).describe("Value is included in the specified array"),
  
  z.object({ 
    nin: filterableArray 
  }).describe("Value is not included in the specified array"),
  
  // Comparison operators
  z.object({ 
    gt: numericValue 
  }).describe("Greater than the specified value"),
  
  z.object({ 
    gte: numericValue 
  }).describe("Greater than or equal to the specified value"),
  
  z.object({ 
    lt: numericValue 
  }).describe("Less than the specified value"),
  
  z.object({ 
    lte: numericValue 
  }).describe("Less than or equal to the specified value"),
  
  // Existence operator
  z.object({ 
    exists: z.boolean() 
  }).describe("Field exists (true) or does not exist (false)")
]);

/**
 * Create a record of filter conditions for multiple fields
 * 
 * This schema allows both direct filter conditions and nested objects with filter conditions.
 * Example:
 * {
 *   name: { eq: "John" },     // direct filter condition
 *   name: "John",             // simplified syntax (equivalent to { eq: "John" })
 *   age: { gt: 18 }
 * }
 */
export const filterConditions = z.record(
  z.union([
    // Allow direct use of values as shorthand for eq
    filterableValue,
    // Allow normal filter condition objects 
    filterCondition
  ])
).describe("Filter records by field values. Object where keys are field API names and values are filter conditions. You can use simple values like 'name': 'John' as shorthand for 'name': { eq: 'John' }.");

/**
 * Create a fully typed version of a filter condition for specific field types
 */
export function createTypedFilterCondition<T extends z.ZodType>(valueType: T) {
  return z.union([
    z.object({ eq: valueType }),
    z.object({ neq: valueType }),
    // Other operators defined based on the valueType
    z.object({ exists: z.boolean() })
  ]);
}

export default filterCondition;