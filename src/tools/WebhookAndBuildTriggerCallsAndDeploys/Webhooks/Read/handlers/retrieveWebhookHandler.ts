import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { webhookSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type RetrieveWebhookParams = z.infer<typeof webhookSchemas.retrieve>;

/**
 * Retrieves a single webhook by ID
 * 
 * @param params Parameters for retrieving a webhook
 * @returns Response with the webhook details
 */
export async function retrieveWebhookHandler(
  params: RetrieveWebhookParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, webhookId } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Fetch the webhook by ID with proper typing
    const webhook = await client.getWebhook(webhookId);

    // Return the webhook details
    return createResponse(JSON.stringify(webhook, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to access webhooks."
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
      `Failed to retrieve webhook: ${extractDetailedErrorInfo(error)}`
    );
  }
}