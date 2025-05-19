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
    
    // String field with string_radio_group/string_select needs enum validator
    if (field_type === 'string' && appearance && 
        (appearance.editor === 'string_radio_group' || appearance.editor === 'string_select') && 
        (!validators || !validators.enum)) {
      return createErrorResponse(
        `Missing required validator 'enum' for string field with ${appearance.editor} editor. ` +
        `Add { \"enum\": { \"values\": [...] } } to validators, and ensure values match the options.`
      );
    }
    
    // Link field needs item_item_type validator
    if (field_type === 'link' && (!validators || !validators.item_item_type)) {
      return createErrorResponse(
        "Missing required validator 'item_item_type' for link field. " +
        "Add { \"item_item_type\": { \"item_types\": [\"your_item_type_id\"] } } to validators."
      );
    }
    
    // Links field needs items_item_type validator
    if (field_type === 'links' && (!validators || !validators.items_item_type)) {
      return createErrorResponse(
        "Missing required validator 'items_item_type' for links field. " +
        "Add { \"items_item_type\": { \"item_types\": [\"your_item_type_id\"] } } to validators."
      );
    }

    // Ensure addons array is present
    let processedAppearance = appearance;
    if (appearance && !appearance.addons) {
      processedAppearance = {
        ...appearance,
        addons: []
      };
    }

    // Correct editor name for lat_lon field type
    if (field_type === 'lat_lon' && processedAppearance && processedAppearance.editor === 'lat_lon_editor') {
      processedAppearance = {
        ...processedAppearance,
        editor: 'map'
      };
    }

    // Build the DatoCMS client
    const client = getClient(apiToken, environment);

    // Prepare field data for the API
    const fieldData: any = {
      type: "field",
      attributes: {
        ...restFieldData,
        field_type: field_type,
        validators: validators || {},
        appearance: processedAppearance || { editor: getDefaultEditor(field_type), parameters: {}, addons: [] }
      }
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

    // Provide more specific guidance
    if (errorMessage.includes("appearance.editor")) {
      if (args.field_type === "lat_lon") {
        return createErrorResponse(
          `Error creating lat_lon field: Make sure you're using "editor": "map" (not "lat_lon_editor") in the appearance. ${errorMessage}`
        );
      } else if (args.field_type === "json") {
        return createErrorResponse(
          `Error creating json field: Make sure you're using one of: "json_editor", "string_multi_select", or "string_checkbox_group" as the editor. ${errorMessage}`
        );
      } else {
        return createErrorResponse(
          `Error with field editor: Invalid editor for field type ${args.field_type}. Check docs/FIELD_CREATION_GUIDE.md for the correct editor names. ${errorMessage}`
        );
      }
    }
    
    // Provide detailed error for field creation errors
    if (errorMessage.includes("INVALID_FORMAT") || errorMessage.includes("INVALID_FIELD")) {
      return createErrorResponse(
        `Error creating field: The field configuration is invalid. 

🔴 COMMON ISSUES AND SOLUTIONS:

1. For string fields with "string_radio_group" or "string_select" appearance:
   REQUIRED: Matching enum validators
   {
     "validators": {
       "enum": {"values": ["option_a", "option_b"]}
     },
     "appearance": {
       "editor": "string_radio_group",
       "parameters": {"radios": [{"label": "Option A", "value": "option_a"}, {"label": "Option B", "value": "option_b"}]},
       "addons": []
     }
   }

2. For location (lat_lon) fields:
   REQUIRED: Use "map" as the editor name
   {
     "field_type": "lat_lon",
     "appearance": {
       "editor": "map",
       "parameters": {},
       "addons": []
     }
   }

3. For text fields:
   REQUIRED: Include empty addons array
   {
     "field_type": "text",
     "appearance": {
       "editor": "textarea",
       "parameters": {"placeholder": "Enter text..."},
       "addons": []
     }
   }

Field Type: ${args.field_type}
Editor: ${args.appearance?.editor || 'not specified'}
Error Details: ${errorMessage}`
      );
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
    lat_lon: "map",
    seo: "seo",
    video: "video",
    slug: "slug"
  };

  return editorMap[fieldType] || "default_editor";
}