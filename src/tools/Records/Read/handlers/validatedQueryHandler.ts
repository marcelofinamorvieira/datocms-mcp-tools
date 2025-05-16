/**
 * @file validatedQueryHandler.ts
 * @description Example handler using the new schema validation system
 */

import { z } from "zod";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { withErrorHandling } from "../../../../utils/errorHandlerWrapper.js";
import { withSchemaValidation } from "../../../../utils/schemaValidationWrapper.js";
import { SchemaRegistry } from "../../../../utils/schemaRegistry.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Register the query schema with our registry
 */
SchemaRegistry.register(
  'records',
  'query',
  recordsSchemas.query,
  'Schema for querying records from DatoCMS'
);

/**
 * Implementation of the query handler that demonstrates schema validation
 * This is a simplified version that doesn't actually call the DatoCMS API
 */
const queryRecordsImplementation = async (args: z.infer<typeof recordsSchemas.query>) => {
  const {
    apiToken,
    environment,
    textSearch,
    ids,
    modelId,
    modelName,
    fields,
    locale,
    order_by,
    version = 'current',
    returnAllLocales = false,
    returnOnlyIds = false,
    page,
    nested = true
  } = args;
  
  // Instead of calling the API, we'll just return a message describing what would be queried
  const queryDescription = {
    message: "Query validation succeeded. In a real handler, this would query the DatoCMS API.",
    queryParams: {
      apiToken: `${apiToken.substring(0, 3)}...${apiToken.substring(apiToken.length - 3)}`, // Don't expose the full token
      environment,
      textSearch,
      ids,
      modelId,
      modelName,
      fields: fields ? "Custom filter provided" : undefined,
      locale,
      order_by,
      version,
      returnAllLocales,
      returnOnlyIds,
      pagination: page ? { offset: page.offset || 0, limit: page.limit || 100 } : undefined,
      nested
    }
  };
  
  return createResponse(JSON.stringify(queryDescription, null, 2));
};

/**
 * Wrap the implementation with schema validation and error handling
 */
export const validatedQueryHandler = withErrorHandling(
  withSchemaValidation('records', 'query', queryRecordsImplementation),
  {
    handlerName: 'queryRecords',
    resourceType: 'record'
  }
);

export default validatedQueryHandler;