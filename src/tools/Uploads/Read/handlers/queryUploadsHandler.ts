import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import {
  isAuthorizationError,
  createErrorResponse,
  extractDetailedErrorInfo 
} from "../../../../utils/errorHandlers.js";
import { uploadsSchemas } from "../../schemas.js";
import { createTypedUploadsClient } from "../../uploadsClient.js";
import { ListUploadsResponse, isUploadsAuthorizationError } from "../../uploadsTypes.js";

export const queryUploadsHandler = async (
  args: z.infer<typeof uploadsSchemas.query>
): Promise<ListUploadsResponse> => {
  const {
    apiToken,
    ids,
    query,
    fields,
    locale,
    order_by,
    page,
    returnOnlyIds,
    environment
  } = args;

  try {
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    const typedClient = createTypedUploadsClient(client);

    // Prepare query parameters
    const queryParams: any = {};
    if (ids) queryParams.ids = ids;
    if (query) queryParams.query = query;
    if (fields) queryParams.fields = fields;
    if (locale) queryParams.locale = locale;
    if (order_by) queryParams.order_by = order_by;
    if (page) queryParams.page = page;

    // Use the typed client
    const uploads = await typedClient.listUploads(queryParams);

    // Handle empty results
    if (!uploads.length) {
      return {
        success: true,
        data: [],
        message: "No uploads matched your query."
      };
    }
    
    // Handle IDs-only request
    if (returnOnlyIds) {
      return {
        success: true,
        data: uploads.map(u => ({ id: u.id, type: u.type })) as any, // Type casting due to partial result
        message: `Found ${uploads.length} uploads matching your query.`
      };
    }
    
    // Return full uploads
    return {
      success: true,
      data: uploads,
      message: `Found ${uploads.length} uploads matching your query.`
    };
  } catch (apiError: unknown) {
    if (isUploadsAuthorizationError(apiError)) {
      return {
        success: false,
        error: "Error: Invalid or unauthorized DatoCMS API token."
      };
    }
    return {
      success: false,
      error: `Error querying uploads: ${extractDetailedErrorInfo(apiError)}`
    };
  }
};