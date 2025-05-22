import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { modelFilterSchemas } from "../../schemas.js";
import { z } from "zod";

type ListModelFiltersArgs = z.infer<typeof modelFilterSchemas.list>;

/**
 * Handler for listing all model filters
 */
export const listModelFiltersHandler = async (args: ListModelFiltersArgs) => {
  const { apiToken, environment } = args;
  
  try {
    // Initialize the DatoCMS client with auth token and environment
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

    // Fetch all model filters
    const modelFilters = await client.itemTypeFilters.list();

    // Return successful response with the model filters data
    return createResponse(modelFilters);
  } catch (error) {
    // Check for authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
    }

    // Pass other errors to the router for handling
    throw error;
  }
};