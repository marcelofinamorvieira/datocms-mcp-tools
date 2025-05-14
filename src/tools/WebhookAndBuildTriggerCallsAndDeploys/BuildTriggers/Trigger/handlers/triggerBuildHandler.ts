import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type TriggerBuildParams = z.infer<typeof buildTriggerSchemas.trigger>;

/**
 * Triggers a build for a specific build trigger
 * 
 * @param params Parameters for triggering a build
 * @returns Response indicating success or failure
 */
export async function triggerBuildHandler(
  params: TriggerBuildParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, buildTriggerId } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Trigger the build with proper typing
    const deployEvent = await client.triggerBuild(buildTriggerId);

    // Return success response with typed data
    return createResponse(JSON.stringify({
      success: true,
      message: `Build triggered successfully for build trigger ID: ${buildTriggerId}`,
      deploy_event: deployEvent
    }, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to trigger builds."
      );
    }

    // Handle not found errors
    if (isNotFoundError(error)) {
      return createErrorResponse(
        `No build trigger found with ID: ${params.buildTriggerId}`
      );
    }

    // Handle other errors
    return createErrorResponse(
      `Failed to trigger build: ${extractDetailedErrorInfo(error)}`
    );
  }
}