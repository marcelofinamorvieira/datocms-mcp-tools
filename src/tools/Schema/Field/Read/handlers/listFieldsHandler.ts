import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isNotFoundError } from "../../../../../utils/errorHandlers.js";

/**
 * Lists fields for a specific item type with optional pagination
 */
export const listFieldsHandler = createCustomHandler({
  domain: "schema",
  schemaName: "list_fields",
  schema: schemaSchemas.list_fields,
  errorContext: {
    operation: "list",
    resourceType: "Field",
    handlerName: "listFieldsHandler"
  }
}, async (args) => {
  const { apiToken, itemTypeId, page, environment } = args;

  // Build the DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

  // First, check if the item type exists
  try {
    await client.itemTypes.find(itemTypeId);
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(`Item type with ID '${itemTypeId}' not found.`);
    }
    throw error;
  }

  // Use the DatoCMS client's proper method for listing fields for an item type
  const fields = await client.fields.list(itemTypeId);

  // Apply pagination to our results if required
  let paginatedFields = fields;
  if (page) {
    const start = page.offset || 0;
    const end = start + (page.limit || 10);
    paginatedFields = fields.slice(start, end);
  }

  // Add information about localized fields if any exist
  const localizedFields = paginatedFields.filter(field => field.localized);
  let message = `Retrieved ${paginatedFields.length} field(s) for item type ID: ${itemTypeId}`;

  if (localizedFields.length > 0) {
    const localizedFieldKeys = localizedFields.map(f => f.api_key).join(', ');
    message += `. Localized fields found: ${localizedFieldKeys}. When creating or updating records, localized fields require values as objects with locale keys (e.g., { "en": "English value", "it": "Italian value" }).`;
  }

  return createResponse({
    success: true,
    data: paginatedFields,
    pagination: page ? {
      offset: page.offset || 0,
      limit: page.limit || 10,
      total: fields.length
    } : undefined,
    localizedFields: localizedFields.length > 0 ?
      localizedFields.map(f => ({ id: f.id, api_key: f.api_key })) :
      undefined,
    message
  });
});