import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse } from "../../../../../utils/errorHandlers.js";
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
    const client = getClient(apiToken, environment);

    // Fetch the model filter by ID
    const modelFilter = await client.itemTypeFilters.find(modelFilterId);

    // Return successful response with the model filter data
    return createResponse(modelFilter);
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