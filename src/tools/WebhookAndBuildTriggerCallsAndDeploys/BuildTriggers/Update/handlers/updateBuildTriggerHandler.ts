import { z } from "zod";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { createWebhookAndBuildTriggerClient } from "../../../webhookAndBuildTriggerClient.js";
import type { McpResponse, UpdateBuildTriggerParams as ClientUpdateParams } from "../../../webhookAndBuildTriggerTypes.js";

type UpdateBuildTriggerParams = z.infer<typeof buildTriggerSchemas.update>;

/**
 * Updates an existing build trigger in DatoCMS
 * 
 * @param params Parameters for updating a build trigger
 * @returns Response with the updated build trigger details
 */
export async function updateBuildTriggerHandler(
  params: UpdateBuildTriggerParams
): Promise<McpResponse> {
  try {
    const { apiToken, environment, buildTriggerId, name, adapter_settings, indexing_enabled } = params;
    
    // Initialize the client with the API token and environment
    const client = createWebhookAndBuildTriggerClient(apiToken, environment);

    // Build update payload with only the provided parameters
    const updatePayload: ClientUpdateParams = {};
    
    if (name !== undefined) updatePayload.name = name;
    if (adapter_settings !== undefined) updatePayload.adapter_settings = adapter_settings;
    if (indexing_enabled !== undefined) updatePayload.indexing_enabled = indexing_enabled;

    // Update the build trigger with proper typing
    const buildTrigger = await client.updateBuildTrigger(buildTriggerId, updatePayload);

    // Return the updated build trigger details
    return createResponse(JSON.stringify(buildTrigger, null, 2));
  } catch (error) {
    // Handle authorization errors
    if (isAuthorizationError(error)) {
      return createErrorResponse(
        "The provided API token does not have permission to update build triggers."
      );
    }

    // Handle not found errors
    if (isNotFoundError(error)) {
      return createErrorResponse(
        `No build trigger found with ID: ${params.buildTriggerId}`
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
      `Failed to update build trigger: ${extractDetailedErrorInfo(error)}`
    );
  }
}