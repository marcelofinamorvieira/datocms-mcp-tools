import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { deployEventSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type ListDeployEventsParams = z.infer<typeof deployEventSchemas.list>;

/**
 * Retrieves a list of deploy events for a build trigger
 * 
 * @param params Parameters for listing deploy events
 * @returns Response with the list of deploy events
 */
export async function listDeployEventsHandler(
  params: ListDeployEventsParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, buildTriggerId, page, filter } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Fetch deploy events for the specific build trigger with optional filters
    const deployEvents = await client.listDeployEvents({
      build_trigger_id: buildTriggerId
    });

    // Format the response
    return createResponse(JSON.stringify({
      build_trigger_id: buildTriggerId,
      events: deployEvents,
      total: deployEvents.length,
    }, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to access deploy events."
      );
    }

    // Handle not found errors for the build trigger
    if (isNotFoundError(error)) {
      return createErrorResponse(
        `No build trigger found with ID: ${params.buildTriggerId}`
      );
    }

    // Handle other errors
    return createErrorResponse(
      `Failed to list deploy events: ${extractDetailedErrorInfo(error)}`
    );
  }
}