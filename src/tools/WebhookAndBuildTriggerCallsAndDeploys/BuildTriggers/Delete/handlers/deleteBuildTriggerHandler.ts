import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type DeleteBuildTriggerParams = z.infer<typeof buildTriggerSchemas.delete>;

/**
 * Deletes a build trigger from DatoCMS
 * 
 * @param params Parameters for deleting a build trigger
 * @returns Response indicating success or failure
 */
export async function deleteBuildTriggerHandler(
  params: DeleteBuildTriggerParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, buildTriggerId } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Delete the build trigger
    await client.deleteBuildTrigger(buildTriggerId);

    // Return success response
    return createResponse(JSON.stringify({
      success: true,
      message: `Build trigger with ID ${buildTriggerId} has been successfully deleted.`
    }, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to delete build triggers."
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
      `Failed to delete build trigger: ${extractDetailedErrorInfo(error)}`
    );
  }
}