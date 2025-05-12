import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { modelFilterSchemas } from "../../schemas.js";
import { z } from "zod";

type UpdateModelFilterArgs = z.infer<typeof modelFilterSchemas.update>;

/**
 * Handler for updating a model filter
 */
export const updateModelFilterHandler = async (args: UpdateModelFilterArgs) => {
  const { 
    apiToken, 
    environment, 
    modelFilterId,
    name,
    filter,
    columns,
    order_by,
    shared
  } = args;
  
  try {
    // Initialize the DatoCMS client with auth token and environment
    const client = getClient(apiToken, environment);

    // Prepare the payload for updating the model filter
    const payload: Record<string, any> = {};

    // Add optional fields if provided
    if (name !== undefined) payload.name = name;
    if (filter !== undefined) payload.filter = filter;
    if (columns !== undefined) payload.columns = columns;
    if (order_by !== undefined) payload.order_by = order_by;
    if (shared !== undefined) payload.shared = shared;

    // Update the model filter using the DatoCMS client
    const updatedModelFilter = await client.itemTypeFilters.update(modelFilterId, payload);

    // Return successful response with the updated model filter data
    return createResponse(updatedModelFilter);
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