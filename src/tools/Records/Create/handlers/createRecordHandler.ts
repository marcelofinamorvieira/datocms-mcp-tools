/**
 * @file createRecordHandler.ts
 * @description Handler for creating a new DatoCMS record
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createCreateHandler, DatoCMSClient, RequestContext, BaseParams } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

// Extend the inferred type with BaseParams
interface CreateRecordParams extends BaseParams {
  itemType: string;
  data: Record<string, unknown>;
  meta?: {
    status?: "published" | "draft" | "updated";
    current_version?: string;
  };
  returnOnlyConfirmation?: boolean;
}

/**
 * Handler for creating a new DatoCMS record
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs field data size and structure
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const createRecordHandler = createCreateHandler<CreateRecordParams, SimpleSchemaTypes.Item>({
  domain: 'records',
  schemaName: 'create',
  schema: recordsSchemas.create,
  entityName: 'Record',
  
  successMessage: (result: SimpleSchemaTypes.Item) => {
    // Use the item type from the result for a more informative message
    const itemType = result.item_type?.id || 'unknown';
    return `Successfully created record with ID '${result.id}' of type '${itemType}'`;
  },
  
  clientAction: async (client: DatoCMSClient, args: CreateRecordParams, _context: RequestContext) => {
    const { 
      itemType, 
      data, 
      meta
    } = args;
    
    // Create the item
    const createdItem = await client.items.create({
      item_type: { 
        id: itemType, 
        type: "item_type" 
      },
      ...data,
      ...(meta && { meta })
    });
    
    // If no item returned, throw an error
    if (!createdItem) {
      throw new Error(`Failed to create a new record of type '${itemType}'.`);
    }
    
    // Always return the full item to maintain type consistency
    // The handler factory will handle response formatting
    return createdItem;
  }
});