import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { webhookCallSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type ResendWebhookCallParams = z.infer<typeof webhookCallSchemas.resend>;

/**
 * Resends a specific webhook call
 * 
 * @param params Parameters for resending a webhook call
 * @returns Response indicating success or failure of the resend operation
 */
export async function resendWebhookCallHandler(
  params: ResendWebhookCallParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, callId } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Resend the webhook call with proper typing
    const webhookCall = await client.resendWebhookCall(callId);

    // Return success response
    return createResponse(JSON.stringify({
      success: true,
      message: `Webhook call with ID ${callId} has been successfully resent.`,
      webhook_call: webhookCall
    }, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to resend webhook calls."
      );
    }

    // Handle not found errors
    if (isNotFoundError(error)) {
      return createErrorResponse(
        `No webhook call found with ID: ${params.callId}`
      );
    }

    // Handle other errors
    return createErrorResponse(
      `Failed to resend webhook call: ${extractDetailedErrorInfo(error)}`
    );
  }
}