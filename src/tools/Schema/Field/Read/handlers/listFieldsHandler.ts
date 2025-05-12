import { buildClient } from "@datocms/cma-client-node";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { z } from "zod";
import { schemaSchemas } from "../../../schemas.js";

export type ListFieldsParams = z.infer<typeof schemaSchemas.list_fields>;

/**
 * Lists fields for a specific item type with optional pagination
 */
export const listFieldsHandler = async (args: ListFieldsParams) => {
  try {
    const { apiToken, itemTypeId, page, environment } = args;

    // Build the DatoCMS client
    const client = buildClient({
      apiToken,
      environment: environment || undefined,
    });

    // First, check if the item type exists
    try {
      await client.itemTypes.find(itemTypeId);
    } catch (error) {
      if (isNotFoundError(error)) {
        return createErrorResponse(`Item type with ID '${itemTypeId}' not found.`);
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
  } catch (error: unknown) {
    if (isAuthorizationError(error)) {
      return createErrorResponse("Authorization failed. Please check your API token.");
    }

    return createErrorResponse(`Error listing fields: ${extractDetailedErrorInfo(error)}`);
  }
};