/**
 * @file createRecordHandler.ts
 * @description Handler for creating a new DatoCMS record
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { withErrorHandling } from "../../../../utils/errorHandlerWrapper.js";
import type { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for creating a new DatoCMS record
 */
export const createRecordHandlerImplementation = async (args: z.infer<typeof recordsSchemas.create>) => {
  const { 
    apiToken, 
    itemType, 
    data, 
    returnOnlyConfirmation = false, 
    environment 
  } = args;
  
  // Initialize DatoCMS client using the unified client manager
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Create the item
  const createdItem = await client.items.create({
    item_type: { 
      id: itemType, 
      type: "item_type" 
    },
    ...data
  });
  
  // If no item returned, throw an error
  if (!createdItem) {
    throw new Error(`Failed to create a new record of type '${itemType}'.`);
  }

  // Return only confirmation message if requested (to save on tokens)
  if (returnOnlyConfirmation) {
    return createResponse(`Successfully created record with ID '${createdItem.id}' of type '${itemType}'.`);
  }

  // Otherwise return the full record data
  return createResponse(JSON.stringify(createdItem, null, 2));
};

// Wrap with consistent error handling
export const createRecordHandler = withErrorHandling(
  createRecordHandlerImplementation,
  {
    handlerName: "createRecord",
    resourceType: "record"
  }
);