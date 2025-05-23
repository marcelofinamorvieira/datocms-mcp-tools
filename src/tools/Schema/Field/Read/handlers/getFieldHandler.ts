import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

/**
 * Retrieves a specific field by ID
 */
export const getFieldHandler = createCustomHandler({
  domain: "schema",
  schemaName: "get_field",
  schema: schemaSchemas.get_field,
  errorContext: {
    operation: "retrieve",
    resourceType: "Field",
    handlerName: "getFieldHandler"
  }
}, async (args) => {
  const { apiToken, fieldId, environment } = args;

  // Build the DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

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
});