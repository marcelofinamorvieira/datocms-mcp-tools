import { buildClient } from "../../../../../utils/clientManager.js";
import { createResponse, createAuthorizationErrorResponse, createNotFoundErrorResponse } from "../../../../../utils/responseHandlers.js";
import { modelFilterSchemas } from "../../schemas.js";
import { z } from "zod";

type RetrieveModelFilterArgs = z.infer<typeof modelFilterSchemas.retrieve>;

/**
 * Handler for retrieving a single model filter by ID
 */
export const retrieveModelFilterHandler = async (args: RetrieveModelFilterArgs) => {
  const { apiToken, environment, modelFilterId } = args;
  
  try {
    // Initialize the DatoCMS client with auth token and environment
    const client = buildClient({ apiToken, environment });
    
    // Fetch the model filter by ID
    const modelFilter = await client.itemTypeFilters.find(modelFilterId);
    
    // Return successful response with the model filter data
    return createResponse(
      "success",
      `Retrieved model filter "${modelFilter.name}".`,
      JSON.stringify(modelFilter, null, 2)
    );
  } catch (error: any) {
    // Check for authorization errors
    if (error?.response?.status === 401) {
      return createAuthorizationErrorResponse("retrieve model filter");
    }
    
    // Check for not found errors
    if (error?.response?.status === 404) {
      return createNotFoundErrorResponse("Model filter", modelFilterId);
    }
    
    // Pass other errors to the router for handling
    throw error;
  }
};