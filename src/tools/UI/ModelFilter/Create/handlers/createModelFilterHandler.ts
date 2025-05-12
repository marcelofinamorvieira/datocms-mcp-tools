import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse } from "../../../../../utils/errorHandlers.js";
import { modelFilterSchemas } from "../../schemas.js";
import { z } from "zod";

type CreateModelFilterArgs = z.infer<typeof modelFilterSchemas.create>;

/**
 * Handler for creating a new model filter
 */
export const createModelFilterHandler = async (args: CreateModelFilterArgs) => {
  const { apiToken, environment, name, item_type, filter, columns, order_by, shared } = args;
  
  try {
    // Initialize the DatoCMS client with auth token and environment
    const client = getClient(apiToken, environment);

    // Prepare the payload for creating a model filter
    const payload: Record<string, any> = {
      name,
      item_type: {
        type: "item_type",
        id: item_type
      }
    };

    // Add optional fields if provided
    if (filter) payload.filter = filter;
    if (columns) payload.columns = columns;
    if (order_by) payload.order_by = order_by;
    if (shared !== undefined) payload.shared = shared;

    // Create the model filter using the DatoCMS client
    const createdModelFilter = await client.itemTypeFilters.create(payload as any);

    // Return successful response with the created model filter data
    return createResponse(createdModelFilter);
  } catch (error) {
    // Check for authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
    }

    // Pass other errors to the router for handling
    throw error;
  }
};