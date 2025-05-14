import { z } from "zod";
import { isAuthorizationError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse } from "../../../webhookAndBuildTriggerTypes.js";

type CreateBuildTriggerParams = z.infer<typeof buildTriggerSchemas.create>;

/**
 * Creates a new build trigger in DatoCMS
 * 
 * @param params Parameters for creating a build trigger
 * @returns Response with the created build trigger details
 */
export async function createBuildTriggerHandler(
  params: CreateBuildTriggerParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, name, adapter, adapter_settings, indexing_enabled } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Create the build trigger with the provided parameters
    const buildTrigger = await client.createBuildTrigger({
      name,
      adapter: adapter as any, // Safe cast since it's validated by zod schema
      adapter_settings,
      indexing_enabled: indexing_enabled ?? false,
    });

    // Return the created build trigger details
    return createResponse(JSON.stringify(buildTrigger, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to create build triggers."
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
        `Invalid build trigger data: ${extractDetailedErrorInfo(error)}`
      );
    }

    // Handle other errors
    return createErrorResponse(
      `Failed to create build trigger: ${extractDetailedErrorInfo(error)}`
    );
  }
}