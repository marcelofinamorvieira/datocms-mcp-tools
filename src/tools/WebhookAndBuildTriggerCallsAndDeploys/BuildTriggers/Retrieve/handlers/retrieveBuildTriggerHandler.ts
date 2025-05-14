import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type RetrieveBuildTriggerParams = z.infer<typeof buildTriggerSchemas.retrieve>;

/**
 * Retrieves a specific build trigger by ID
 * 
 * @param params Parameters for retrieving a build trigger
 * @returns Response with the build trigger details
 */
export async function retrieveBuildTriggerHandler(
  params: RetrieveBuildTriggerParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, buildTriggerId } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Fetch the build trigger by ID with proper typing
    const buildTrigger = await client.getBuildTrigger(buildTriggerId);

    // Return the build trigger details
    return createResponse(JSON.stringify(buildTrigger, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to access build triggers."
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
      `Failed to retrieve build trigger: ${extractDetailedErrorInfo(error)}`
    );
  }
}