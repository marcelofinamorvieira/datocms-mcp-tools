import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { z } from "zod";
import { schemaSchemas } from "../../../schemas.js";

export type DeleteFieldParams = z.infer<typeof schemaSchemas.delete_field>;

/**
 * Deletes a field from a DatoCMS item type
 */
export const deleteFieldHandler = async (args: DeleteFieldParams) => {
  try {
    const { apiToken, fieldId, environment } = args;

    // Build the DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken as string, environment as string);

    // First, get the field to return its info later
    const field = await client.fields.find(fieldId as string);

    // Delete the field
    await client.fields.destroy(fieldId as string);

    return createResponse({
      success: true,
      data: { id: fieldId, label: field.label },
      message: `Field '${field.label}' (ID: ${fieldId}) deleted successfully.`
    });
  } catch (error: unknown) {
    if (isAuthorizationError(error)) {
      return createErrorResponse("Authorization failed. Please check your API token.");
    }

    if (isNotFoundError(error)) {
      return createErrorResponse(`Field with ID '${args.fieldId}' not found.`);
    }

    return createErrorResponse(`Error deleting field: ${extractDetailedErrorInfo(error)}`);
  }
};