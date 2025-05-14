import { getClient } from "../../../../../utils/clientManager.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { z } from "zod";
import { schemaSchemas } from "../../../schemas.js";

export type GetFieldParams = z.infer<typeof schemaSchemas.get_field>;

/**
 * Retrieves a specific field by ID
 */
export const getFieldHandler = async (args: GetFieldParams) => {
  try {
    const { apiToken, fieldId, environment } = args;

    // Build the DatoCMS client
    const client = getClient(apiToken, environment);

    // Get the field by ID
    const field = await client.fields.find(fieldId);

    // Add special note if the field is localized to help guide users
    if (field.localized) {
      return createResponse({
        success: true,
        data: field,
        message: `Field retrieved successfully. NOTE: This field is localized, meaning its values must be provided as an object with locale keys when creating or updating records. Example: { "${field.api_key}": { "en": "English value", "it": "Italian value" } }`
      });
    }

    return createResponse({
      success: true,
      data: field,
      message: `Field retrieved successfully.`
    });
  } catch (error: unknown) {
    if (isAuthorizationError(error)) {
      return createErrorResponse("Authorization failed. Please check your API token.");
    }

    if (isNotFoundError(error)) {
      return createErrorResponse(`Field with ID '${args.fieldId}' not found.`);
    }

    return createErrorResponse(`Error retrieving field: ${extractDetailedErrorInfo(error)}`);
  }
};