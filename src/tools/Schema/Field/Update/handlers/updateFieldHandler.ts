import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { createResponse, Response as MCPResponse } from "../../../../../utils/responseHandlers.js";
import { schemaSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import type { BaseParams } from "../../../../../utils/enhancedHandlerFactory.js";
import type { Client } from "@datocms/cma-client-node";

interface UpdateFieldParams extends BaseParams {
  fieldId: string;
  field_type?: string;
  appearance?: Record<string, unknown>;
  validators?: Record<string, unknown>;
  fieldset_id?: string | null;
  [key: string]: unknown;
}

/**
 * Updates an existing field
 */
export const updateFieldHandler = createCustomHandler<UpdateFieldParams, MCPResponse>({
  domain: "schema",
  schemaName: "update_field",
  schema: schemaSchemas.update_field,
  errorContext: {
    operation: "update",
    resourceType: "Field",
    handlerName: "updateFieldHandler"
  }
}, async (args) => {
  const { apiToken, fieldId, environment, field_type, appearance, validators, fieldset_id, ...restFieldData } = args;

  // Build the DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment) as Client;

  // First, check if the field exists and get the current field data
  const existingField = await client.fields.find(fieldId);

  // Create the update data object with proper structure
  interface UpdateData {
    data: {
      type: "field";
      id: string;
      attributes: Record<string, unknown>;
      relationships: Record<string, unknown>;
    };
  }
  
  const updateData: UpdateData = {
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
  await client.fields.rawUpdate(fieldId, updateData as any);

  // Fetch the updated field
  const updatedField = await client.fields.find(fieldId);

  return createResponse({
    success: true,
    data: updatedField,
    message: `Field updated successfully.`
  });
});