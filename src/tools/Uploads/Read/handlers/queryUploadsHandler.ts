import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import type { SimpleSchemaTypes } from "@datocms/cma-client-node";

export const queryUploadsHandler = createListHandler({
  domain: "uploads",
  schemaName: "query",
  schema: uploadsSchemas.query,
  entityName: "Upload",
  clientAction: async (client, args) => {
    // Prepare query parameters
    const queryParams: any = {};
    
    // Handle ids - convert string to array if needed
    if (args.ids) {
      queryParams["filter[ids][in]"] = Array.isArray(args.ids) 
        ? args.ids 
        : args.ids.split(',').map((id: string) => id.trim());
    }
    
    // Handle text search
    if (args.query) {
      queryParams["filter[query]"] = args.query;
    }
    
    // Handle locale
    if (args.locale) {
      queryParams["filter[locale]"] = args.locale;
    }
    
    // Handle ordering
    if (args.order_by) {
      queryParams["order_by"] = args.order_by;
    }
    
    // Handle pagination
    if (args.page) {
      queryParams.page = args.page;
    }

    const uploads = await client.uploads.list(queryParams);
    
    // Handle empty results
    if (!uploads.length) {
      return [];
    }
    
    // Handle IDs-only request
    if (args.returnOnlyIds) {
      return uploads.map((u: SimpleSchemaTypes.Upload) => ({ id: u.id, type: u.type }));
    }
    
    // Return full uploads
    return uploads;
  }
});