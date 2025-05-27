import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { createResponse, Response as MCPResponse } from "../../../../../utils/responseHandlers.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { schemaSchemas } from "../../../schemas.js";
import { validateAndPrepareField } from "../../../fieldValidator.js";
import type { BaseParams } from "../../../../../utils/enhancedHandlerFactory.js";
import type { Client, SimpleSchemaTypes } from "@datocms/cma-client-node";

interface CreateFieldParams extends BaseParams {
  itemTypeId: string;
  field_type: string;
  label: string;
  apiKey?: string;
  validators?: Record<string, unknown>;
  appearance?: {
    editor: string;
    parameters?: Record<string, unknown>;
    addons?: unknown[];
  };
  [key: string]: unknown; // For additional field properties
}

/**
 * Creates a new field in a DatoCMS item type
 * Reference: https://www.datocms.com/docs/content-management-api/resources/field/create
 */
export const createFieldHandler = createCustomHandler<CreateFieldParams, MCPResponse>({
  domain: "schema",
  schemaName: "create_field",
  schema: schemaSchemas.create_field,
  errorContext: {
    operation: "create",
    resourceType: "Field",
    handlerName: "createFieldHandler"
  }
}, async (args) => {
  const { apiToken, itemTypeId, environment, field_type, validators, appearance, ...restFieldData } = args;

  // Validate and prepare field configuration
  const validatedConfig = validateAndPrepareField({
    field_type,
    validators,
    appearance
  });

  // Build the DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment) as Client;

  // Prepare field data for the API
  const fieldData: Record<string, unknown> = {
    ...restFieldData,
    field_type: field_type,
    validators: validatedConfig.validators || {},
    appearance: validatedConfig.appearance
  };

  try {
    // Create the field
    const field = await client.fields.create(itemTypeId, fieldData as SimpleSchemaTypes.FieldCreateSchema);

    return createResponse({
      success: true,
      data: field,
      message: `Field '${field.label}' created successfully with ID: ${field.id}`
    });
  } catch (error: unknown) {
    // Extract error details
    const errorMessage = extractDetailedErrorInfo(error);
    
    // Provide helpful error messages based on field type
    if (typeof errorMessage === 'string' && errorMessage.includes("INVALID_")) {
      throw new Error(
        `Error creating ${field_type} field: ${errorMessage}\n` +
        `See https://www.datocms.com/docs/content-management-api/resources/field/create for field requirements.`
      );
    }
    
    throw new Error(`Error creating field: ${errorMessage}`);
  }
});