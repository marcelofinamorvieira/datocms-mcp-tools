import { buildClient } from "../../../../../utils/clientManager.js";
import { createResponse, createAuthorizationErrorResponse, createNotFoundErrorResponse } from "../../../../../utils/responseHandlers.js";
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
    const client = buildClient({ apiToken, environment });
    
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
    return createResponse(
      "success",
      `Model filter "${updatedModelFilter.name}" updated successfully.`,
      JSON.stringify(updatedModelFilter, null, 2)
    );
  } catch (error: any) {
    // Check for authorization errors
    if (error?.response?.status === 401) {
      return createAuthorizationErrorResponse("update model filter");
    }
    
    // Check for not found errors
    if (error?.response?.status === 404) {
      return createNotFoundErrorResponse("Model filter", modelFilterId);
    }
    
    // Pass other errors to the router for handling
    throw error;
  }
};