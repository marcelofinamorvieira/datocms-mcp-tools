import { z } from "zod";
import { isAuthorizationError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { webhookSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse, CreateWebhookParams as ClientCreateParams } from "../../../webhookAndBuildTriggerTypes.js";

type CreateWebhookParams = z.infer<typeof webhookSchemas.create>;

/**
 * Creates a new webhook in DatoCMS
 * 
 * @param params Parameters for creating a webhook
 * @returns Response with the created webhook details
 */
export async function createWebhookHandler(
  params: CreateWebhookParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, name, url, headers, events } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Create the webhook with the provided parameters using our typed client
    const createParams: ClientCreateParams = {
      name,
      url,
      headers: headers || {},
      events
    };

    // Create the webhook with proper typing
    const webhook = await client.createWebhook(createParams);

    // Return the created webhook details
    return createResponse(JSON.stringify(webhook, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to create webhooks."
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
      `Failed to create webhook: ${extractDetailedErrorInfo(error)}`
    );
  }
}