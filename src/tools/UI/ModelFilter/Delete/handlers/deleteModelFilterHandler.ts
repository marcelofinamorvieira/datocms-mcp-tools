import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
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
    const client = getClient(apiToken, environment);

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
    return createResponse(`Model filter "${modelFilterName}" deleted successfully.`);
  } catch (error) {
    // Check for authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
    }

    // Check for not found errors
    if (isNotFoundError(error)) {
      return createErrorResponse(`Error: Model filter with ID '${modelFilterId}' was not found.`);
    }

    // Pass other errors to the router for handling
    throw error;
  }
};