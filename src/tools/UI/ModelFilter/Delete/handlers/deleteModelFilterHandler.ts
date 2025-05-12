import { buildClient } from "../../../../../utils/clientManager.js";
import { createResponse, createAuthorizationErrorResponse, createNotFoundErrorResponse } from "../../../../../utils/responseHandlers.js";
import { modelFilterSchemas } from "../../schemas.js";
import { z } from "zod";

type DeleteModelFilterArgs = z.infer<typeof modelFilterSchemas.delete>;

/**
 * Handler for deleting a model filter
 */
export const deleteModelFilterHandler = async (args: DeleteModelFilterArgs) => {
  const { apiToken, environment, modelFilterId } = args;
  
  try {
    // Initialize the DatoCMS client with auth token and environment
    const client = buildClient({ apiToken, environment });
    
    // First retrieve the model filter to get its name for the success message
    let modelFilterName = "Unknown";
    try {
      const modelFilter = await client.itemTypeFilters.find(modelFilterId);
      modelFilterName = modelFilter.name;
    } catch (error) {
      // If we can't find the model filter, continue with the deletion attempt
      // This will likely result in a 404 error below
    }
    
    // Delete the model filter using the DatoCMS client
    await client.itemTypeFilters.destroy(modelFilterId);
    
    // Return successful response
    return createResponse(
      "success",
      `Model filter "${modelFilterName}" deleted successfully.`
    );
  } catch (error: any) {
    // Check for authorization errors
    if (error?.response?.status === 401) {
      return createAuthorizationErrorResponse("delete model filter");
    }
    
    // Check for not found errors
    if (error?.response?.status === 404) {
      return createNotFoundErrorResponse("Model filter", modelFilterId);
    }
    
    // Pass other errors to the router for handling
    throw error;
  }
};