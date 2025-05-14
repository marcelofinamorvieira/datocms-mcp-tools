import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { webhookSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type DeleteWebhookParams = z.infer<typeof webhookSchemas.delete>;

/**
 * Deletes a webhook from DatoCMS
 * 
 * @param params Parameters for deleting a webhook
 * @returns Response indicating success or failure
 */
export async function deleteWebhookHandler(
  params: DeleteWebhookParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, webhookId } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Delete the webhook with proper typing
    await client.deleteWebhook(webhookId);

    // Return success response
    return createResponse(JSON.stringify({
      success: true,
      message: `Webhook with ID ${webhookId} has been successfully deleted.`
    }, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to delete webhooks."
      );
    }

    // Handle not found errors
    if (isNotFoundError(error)) {
      return createErrorResponse(
        `No webhook found with ID: ${params.webhookId}`
      );
    }

    // Handle other errors
    return createErrorResponse(
      `Failed to delete webhook: ${extractDetailedErrorInfo(error)}`
    );
  }
}