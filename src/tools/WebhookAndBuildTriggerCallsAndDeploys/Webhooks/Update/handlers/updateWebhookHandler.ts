import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { webhookSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse, UpdateWebhookParams as ClientUpdateParams } from "../../../webhookAndBuildTriggerTypes.js";

type UpdateWebhookParams = z.infer<typeof webhookSchemas.update>;

/**
 * Updates an existing webhook in DatoCMS
 * 
 * @param params Parameters for updating a webhook
 * @returns Response with the updated webhook details
 */
export async function updateWebhookHandler(
  params: UpdateWebhookParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, webhookId, name, url, headers, events } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Build update payload with only the provided parameters
    const updatePayload: ClientUpdateParams = {};
    
    if (name !== undefined) updatePayload.name = name;
    if (url !== undefined) updatePayload.url = url;
    if (headers !== undefined) updatePayload.headers = headers;
    if (events !== undefined) updatePayload.events = events;

    // Update the webhook with proper typing
    const webhook = await client.updateWebhook(webhookId, updatePayload);

    // Return the updated webhook details
    return createResponse(JSON.stringify(webhook, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to update webhooks."
      );
    }

    // Handle not found errors
    if (isNotFoundError(error)) {
      return createErrorResponse(
        `No webhook found with ID: ${params.webhookId}`
      );
    }

    // Handle validation errors
    if (
      typeof error === 'object' && 
      error !== null && 
      ('status' in error && error.status === 422 ||
       'message' in error && typeof error.message === 'string' && 
       (error.message.includes('422') || error.message.toLowerCase().includes('validation')))
    ) {
      return createErrorResponse(
        `Invalid webhook data: ${extractDetailedErrorInfo(error)}`
      );
    }

    // Handle other errors
    return createErrorResponse(
      `Failed to update webhook: ${extractDetailedErrorInfo(error)}`
    );
  }
}