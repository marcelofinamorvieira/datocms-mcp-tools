import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { z } from "zod";
import { schemaSchemas } from "../../../schemas.js";

export type UpdateFieldParams = z.infer<typeof schemaSchemas.update_field>;

/**
 * Updates an existing field
 */
export const updateFieldHandler = async (args: UpdateFieldParams) => {
  try {
    const { apiToken, fieldId, environment, field_type, appearance, validators, fieldset_id, ...restFieldData } = args;

    // Build the DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

    // First, check if the field exists and get the current field data
    const existingField = await client.fields.find(fieldId);

    // Create the update data object with proper structure
    const updateData: any = {
      data: {
        type: "field" as const,
        id: fieldId,
        attributes: {
          ...restFieldData
        },
        relationships: {}
      }
    };

    // Only add attribute properties if they're provided
    if (field_type !== undefined) {
      updateData.data.attributes.field_type = field_type;
    }

    if (appearance !== undefined) {
      updateData.data.attributes.appearance = appearance;
    }

    if (validators !== undefined) {
      updateData.data.attributes.validators = validators;
    }

    // Handle fieldset relationship - if not provided, maintain existing relationship
    // This addresses the issue where fieldset relationship was lost during updates
    if (fieldset_id !== undefined) {
      // If fieldset_id is explicitly provided, set it
      updateData.data.relationships.fieldset = {
        data: fieldset_id ? { type: "fieldset", id: fieldset_id } : null
      };
    } else if (existingField.fieldset) {
      // If not provided but the field has a fieldset, maintain it
      updateData.data.relationships.fieldset = {
        data: { type: "fieldset", id: existingField.fieldset }
      };
    }

    // Use rawUpdate to directly pass the properly formatted JSON:API data
    await client.fields.rawUpdate(fieldId, updateData);

    // Fetch the updated field
    const updatedField = await client.fields.find(fieldId);

    return createResponse({
      success: true,
      data: updatedField,
      message: `Field updated successfully.`
    });
  } catch (error: unknown) {
    if (isAuthorizationError(error)) {
      return createErrorResponse("Authorization failed. Please check your API token.");
    }

    if (isNotFoundError(error)) {
      return createErrorResponse(`Field with ID '${args.fieldId}' not found.`);
    }

    return createErrorResponse(`Error updating field: ${extractDetailedErrorInfo(error)}`);
  }
};