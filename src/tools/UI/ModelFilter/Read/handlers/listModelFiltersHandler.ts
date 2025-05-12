import { buildClient } from "../../../../../utils/clientManager.js";
import { createResponse, createAuthorizationErrorResponse } from "../../../../../utils/responseHandlers.js";
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
    const client = buildClient({ apiToken, environment });
    
    // Fetch all model filters
    const modelFilters = await client.itemTypeFilters.list();
    
    // Return successful response with the model filters data
    return createResponse(
      "success",
      `Retrieved ${modelFilters.length} model filters.`,
      JSON.stringify(modelFilters, null, 2)
    );
  } catch (error: any) {
    // Check for authorization errors
    if (error?.response?.status === 401) {
      return createAuthorizationErrorResponse("list model filters");
    }
    
    // Pass other errors to the router for handling
    throw error;
  }
};