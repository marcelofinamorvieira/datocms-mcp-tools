import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { getClient } from "../../../../../utils/clientManager.js";
import { z } from "zod";
import { schemaSchemas } from "../../../schemas.js";

export type CreateFieldParams = z.infer<typeof schemaSchemas.create_field>;

/**
 * Creates a new field in a DatoCMS item type with improved error handling
 */
export const createFieldHandler = async (args: CreateFieldParams) => {
  try {
    const { apiToken, itemTypeId, environment, field_type, validators, appearance, ...restFieldData } = args;

    // Field-type specific validation
    if (field_type === 'rich_text' && (!validators || !validators.rich_text_blocks)) {
      return createErrorResponse(
        "Missing required validator 'rich_text_blocks' for rich_text field. " +
        "Add { \"rich_text_blocks\": { \"item_types\": [] } } to validators."
      );
    }

    if (field_type === 'structured_text' && (!validators || !validators.structured_text_blocks)) {
      return createErrorResponse(
        "Missing required validator 'structured_text_blocks' for structured_text field. " +
        "Add { \"structured_text_blocks\": { \"item_types\": [] } } to validators."
      );
    }

    if (appearance && !appearance.addons) {
      return createErrorResponse(
        "Missing required 'addons' array in appearance configuration. " +
        "Always include it, at minimum as an empty array: { \"addons\": [] }"
      );
    }

    // Build the DatoCMS client
    const client = getClient(apiToken, environment);

    // Prepare field data for the API
    const fieldData: any = {
      ...restFieldData,
      field_type: field_type,
      validators: validators || {},
      appearance: appearance || { editor: getDefaultEditor(field_type), parameters: {}, addons: [] }
    };

    // Create the field
    const field = await client.fields.create(itemTypeId, fieldData);

    return createResponse({
      success: true,
      data: field,
      message: `Field '${field.label}' created successfully with ID: ${field.id}`
    });
  } catch (error: unknown) {
    if (isAuthorizationError(error)) {
      return createErrorResponse("Authorization failed. Please check your API token.");
    }

    if (isNotFoundError(error)) {
      return createErrorResponse(`Item type with ID '${args.itemTypeId}' not found.`);
    }

    // Enhanced error messages for common issues
    const errorMessage = extractDetailedErrorInfo(error);
    
    if (typeof errorMessage === 'string') {
      if (errorMessage.includes("addons")) {
        return createErrorResponse(
          "The 'addons' field is required in appearance object. " +
          "Always include it, at minimum as an empty array: { \"addons\": [] }"
        );
      }
      
      if (errorMessage.includes("rich_text_blocks")) {
        return createErrorResponse(
          "Rich text fields require the 'rich_text_blocks' validator. " +
          "Example: { \"rich_text_blocks\": { \"item_types\": [] } }"
        );
      }

      if (errorMessage.includes("start_collapsed")) {
        return createErrorResponse(
          "Invalid parameter 'start_collapsed' for the specified field type's appearance. " +
          "Make sure you're using the correct parameters for your field type's editor. " +
          "For rich_text fields, use: { \"editor\": \"rich_text\", \"parameters\": { \"start_collapsed\": false }, \"addons\": [] }"
        );
      }
    }

    return createErrorResponse(`Error creating field: ${errorMessage}`);
  }
};

/**
 * Gets a default editor based on field type
 */
function getDefaultEditor(fieldType: string): string {
  const editorMap: Record<string, string> = {
    string: "single_line",
    text: "textarea",
    rich_text: "rich_text",
    structured_text: "structured_text",
    boolean: "boolean",
    integer: "integer",
    float: "float",
    date: "date_picker",
    date_time: "date_time_picker",
    file: "file",
    gallery: "gallery",
    link: "link_editor",
    links: "links_editor",
    color: "color_picker",
    json: "json_editor",
    lat_lon: "lat_lon_editor",
    seo: "seo",
    video: "video",
    slug: "slug"
  };

  return editorMap[fieldType] || "default_editor";
}