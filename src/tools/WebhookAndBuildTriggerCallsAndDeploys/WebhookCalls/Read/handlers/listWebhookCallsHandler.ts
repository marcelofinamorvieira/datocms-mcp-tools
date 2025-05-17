import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { webhookCallSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type ListWebhookCallsParams = z.infer<typeof webhookCallSchemas.list>;

/**
 * Retrieves a list of webhook call logs for a specific webhook
 * 
 * @param params Parameters for listing webhook call logs
 * @returns Response with the list of webhook call logs
 */
export async function listWebhookCallsHandler(
  params: ListWebhookCallsParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, webhookId } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Fetch webhook call logs for the specific webhook with proper typing
    const webhookCalls = await client.listWebhookCalls({
      webhook_id: webhookId
    });

    // Format the response
    return createResponse(JSON.stringify({
      webhook_id: webhookId,
      calls: webhookCalls,
      total: webhookCalls.length,
    }, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to access webhook call logs."
      );
    }

    // Handle not found errors for the webhook
    if (isNotFoundError(error)) {
      return createErrorResponse(
        `No webhook found with ID: ${params.webhookId}`
      );
    }

    // Handle other errors
    return createErrorResponse(
      `Failed to list webhook call logs: ${extractDetailedErrorInfo(error)}`
    );
  }
}