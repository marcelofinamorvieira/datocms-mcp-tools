/**
 * @file validatedQueryHandler.ts
 * @description Example handler using the new schema validation system
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler that demonstrates schema validation
 * This is a simplified version that doesn't actually call the DatoCMS API
 */
export const validatedQueryHandler = createCustomHandler({
  domain: "records",
  schemaName: "query",
  schema: recordsSchemas.query,
  entityName: "Record Query Validation",
  clientAction: async (_client, args) => {
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
    
    return queryDescription;
  }
});

export default validatedQueryHandler;