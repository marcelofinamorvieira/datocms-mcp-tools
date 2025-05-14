import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { webhookCallSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type RetrieveWebhookCallParams = z.infer<typeof webhookCallSchemas.retrieve>;

/**
 * Retrieves a specific webhook call log by ID
 * 
 * @param params Parameters for retrieving a webhook call log
 * @returns Response with the webhook call log details
 */
export async function retrieveWebhookCallHandler(
  params: RetrieveWebhookCallParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, callId } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Fetch the specific webhook call log with proper typing
    const webhookCall = await client.getWebhookCall(callId);

    // Return the webhook call details
    return createResponse(JSON.stringify(webhookCall, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to access webhook call logs."
      );
    }

    // Handle not found errors
    if (isNotFoundError(error)) {
      return createErrorResponse(
        `No webhook call log found with ID: ${params.callId}`
      );
    }

    // Handle other errors
    return createErrorResponse(
      `Failed to retrieve webhook call log: ${extractDetailedErrorInfo(error)}`
    );
  }
}