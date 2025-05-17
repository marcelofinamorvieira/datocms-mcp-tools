import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { deployEventSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type RetrieveDeployEventParams = z.infer<typeof deployEventSchemas.retrieve>;

/**
 * Retrieves a specific deploy event by ID
 * 
 * @param params Parameters for retrieving a deploy event
 * @returns Response with the deploy event details
 */
export async function retrieveDeployEventHandler(
  params: RetrieveDeployEventParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, eventId } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Fetch the specific deploy event with proper typing
    const deployEvent = await client.getDeployEvent(eventId);

    // Return the deploy event details
    return createResponse(JSON.stringify(deployEvent, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to access deploy events."
      );
    }

    // Handle not found errors
    if (isNotFoundError(error)) {
      return createErrorResponse(
        `No deploy event found with ID: ${params.eventId}`
      );
    }

    // Handle other errors
    return createErrorResponse(
      `Failed to retrieve deploy event: ${extractDetailedErrorInfo(error)}`
    );
  }
}