import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import { createStandardResponse } from "../../../../utils/standardResponse.js";

export const queryUploadsHandler = createListHandler({
  domain: "uploads",
  schemaName: "query",
  schema: uploadsSchemas.query,
  entityName: "Upload",
  listGetter: async (client, args) => {
    // Prepare query parameters
    const queryParams: any = {};
    if (args.ids) queryParams.ids = args.ids;
    if (args.query) queryParams.query = args.query;
    if (args.fields) queryParams.fields = args.fields;
    if (args.locale) queryParams.locale = args.locale;
    if (args.order_by) queryParams.order_by = args.order_by;
    if (args.page) queryParams.page = args.page;

    const uploads = await client.uploads.list(queryParams);
    
    // Handle empty results
    if (!uploads.length) {
      return createStandardResponse({
        success: true,
        data: [],
        message: "No uploads matched your query."
      });
    }
    
    // Handle IDs-only request
    if (args.returnOnlyIds) {
      return createStandardResponse({
        success: true,
        data: uploads.map(u => ({ id: u.id, type: u.type })),
        message: `Found ${uploads.length} uploads matching your query.`
      });
    }
    
    // Return full uploads
    return uploads;
  }
});