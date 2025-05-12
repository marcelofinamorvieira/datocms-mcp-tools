import { buildClient } from "../../../../../utils/clientManager.js";
import { createResponse, createAuthorizationErrorResponse } from "../../../../../utils/responseHandlers.js";
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
    const client = buildClient({ apiToken, environment });
    
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
    const createdModelFilter = await client.itemTypeFilters.create(payload);
    
    // Return successful response with the created model filter data
    return createResponse(
      "success",
      `Model filter "${name}" created successfully.`,
      JSON.stringify(createdModelFilter, null, 2)
    );
  } catch (error: any) {
    // Check for authorization errors
    if (error?.response?.status === 401) {
      return createAuthorizationErrorResponse("create model filter");
    }
    
    // Pass other errors to the router for handling
    throw error;
  }
};