import { z } from "zod";
import { isAuthorizationError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type ListBuildTriggersParams = z.infer<typeof buildTriggerSchemas.list>;

/**
 * Retrieves a list of all build triggers in the DatoCMS project
 * 
 * @param params Parameters for listing build triggers
 * @returns Response with the list of build triggers
 */
export async function listBuildTriggersHandler(
  params: ListBuildTriggersParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Fetch all build triggers with proper typing
    const buildTriggers = await client.listBuildTriggers();

    // Return the list of build triggers
    return createResponse(JSON.stringify({
      build_triggers: buildTriggers,
      total: buildTriggers.length
    }, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to access build triggers."
      );
    }

    // Handle other errors
    return createErrorResponse(
      `Failed to list build triggers: ${extractDetailedErrorInfo(error)}`
    );
  }
}