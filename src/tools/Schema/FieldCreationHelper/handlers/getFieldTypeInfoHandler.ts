import { createResponse } from "../../../../utils/responseHandlers.js";
import { getClient } from "../../../../utils/clientManager.js";
import type { StandardResponse } from "../../../../utils/standardResponse.js";
import { fieldTemplates, getAvailableFieldTypes, getAvailableAppearances, getFieldTemplate } from "../fieldTemplates/index.js";

/**
 * Field Type Documentation Organized by Categories
 */
const fieldTypeDocs = {
  textFields: {
    string: {
      description: "String field for single lines of text",
      validators: {
        required: { description: "Makes the field required" },
        length: { description: "Validates text length", example: { min: 5, max: 100 } },
        enum: { description: "Restricts to predefined values", example: { values: ["value1", "value2"] } }
      },
      appearances: {
        single_line: {
          description: "Standard single-line text input",
          parameters: {
            heading: { description: "Controls visual prominence", default: false }
          },
          example: {
            editor: "single_line",
            parameters: { heading: false },
            addons: []
          }
        },
        string_radio_group: {
          description: "Radio button group for selecting predefined values",
          parameters: {
            radios: { description: "Array of options with label/value pairs" }
          },
          example: {
            editor: "string_radio_group",
            parameters: {
              radios: [
                { label: "Blog Post", value: "blog_post" },
                { label: "News Article", value: "news_article" }
              ]
            },
            addons: []
          },
          notes: "Requires enum validator with matching values"
        },
        string_select: {
          description: "Dropdown select for predefined values",
          parameters: {
            options: { description: "Array of options with label/value pairs" }
          },
          example: {
            editor: "string_select",
            parameters: {
              options: [
                { label: "Technology", value: "technology" },
                { label: "Marketing", value: "marketing" }
              ]
            },
            addons: []
          },
          notes: "Requires enum validator with matching values"
        }
      },
      defaultValue: {
        description: "Simple string (for non-localized fields)",
        example: "Default Title",
        notes: "Avoid setting default values for localized fields"
      },
      fullExample: {
        label: "Single Line Title",
        api_key: "single_line_title",
        field_type: "string",
        hint: "Enter the content title (minimum 5 characters, maximum 100)",
        localized: true,
        appearance: {
          editor: "single_line",
          parameters: { heading: false },
          addons: []
        },
        validators: {
          required: {},
          length: { min: 5, max: 100 }
        }
      }
    },
    text: {
      description: "Text field for multi-line content",
      validators: {
        required: { description: "Makes the field required" }
      },
      appearances: {
        textarea: {
          description: "Standard multi-line text area",
          parameters: {
            placeholder: { description: "Placeholder text shown when field is empty" }
          },
          example: {
            editor: "textarea",
            parameters: { placeholder: "Enter detailed description here..." },
            addons: []
          }
        },
        wysiwyg: {
          description: "What-you-see-is-what-you-get rich text editor",
          parameters: {},
          example: {
            editor: "wysiwyg",
            parameters: {},
            addons: []
          }
        },
        markdown: {
          description: "Markdown text editor",
          parameters: {},
          example: {
            editor: "markdown",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Not well supported, especially for localized fields",
        notes: "Avoid using default values for text fields"
      },
      fullExample: {
        label: "Description Textarea",
        api_key: "description_textarea",
        field_type: "text",
        hint: "Provide a detailed description of the content",
        localized: true,
        appearance: {
          editor: "textarea",
          parameters: { placeholder: "Enter detailed description here..." },
          addons: []
        },
        validators: {
          required: {}
        }
      }
    }
  },
  numberFields: {
    integer: {
      description: "Whole number field",
      validators: {
        required: { description: "Makes the field required" },
        number_range: { description: "Validates number range", example: { min: 1, max: 100 } }
      },
      appearances: {
        integer: {
          description: "Standard integer input",
          parameters: {
            placeholder: { description: "Placeholder text shown when field is empty" }
          },
          example: {
            editor: "integer",
            parameters: { placeholder: "Enter position number..." },
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Numeric value",
        example: 10
      },
      fullExample: {
        label: "Sort Order",
        api_key: "sort_order",
        field_type: "integer",
        hint: "Enter the display order (1-100, lower numbers appear first)",
        appearance: {
          editor: "integer",
          parameters: { placeholder: "Enter position number..." },
          addons: []
        },
        validators: {
          required: {},
          number_range: { min: 1, max: 100 }
        },
        default_value: 10
      }
    },
    float: {
      description: "Decimal number field",
      validators: {
        required: { description: "Makes the field required" },
        number_range: { description: "Validates number range", example: { min: 0.01, max: 9999.99 } }
      },
      appearances: {
        float: {
          description: "Standard decimal number input",
          parameters: {},
          example: {
            editor: "float",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Numeric value",
        example: 29.99
      },
      fullExample: {
        label: "Product Price",
        api_key: "product_price",
        field_type: "float",
        hint: "Enter the price in dollars (0.01-9999.99)",
        appearance: {
          editor: "float",
          parameters: {},
          addons: []
        },
        validators: {
          required: {},
          number_range: { min: 0.01, max: 9999.99 }
        },
        default_value: 29.99
      }
    }
  },
  dateFields: {
    date: {
      description: "Date picker field",
      validators: {
        required: { description: "Makes the field required" },
        date_range: { description: "Validates date range", example: { min: "2023-01-01", max: "2030-12-31" } }
      },
      appearances: {
        date_picker: {
          description: "Date picker calendar interface",
          parameters: {},
          example: {
            editor: "date_picker",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "String in format YYYY-MM-DD",
        example: "2023-06-15"
      },
      fullExample: {
        label: "Publication Date",
        api_key: "publication_date",
        field_type: "date",
        hint: "Select the publication date (must be between 2023-2030)",
        appearance: {
          editor: "date_picker",
          parameters: {},
          addons: []
        },
        validators: {
          required: {},
          date_range: { min: "2023-01-01", max: "2030-12-31" }
        },
        default_value: "2023-06-15"
      }
    },
    date_time: {
      description: "Date and time picker field",
      validators: {
        required: { description: "Makes the field required" }
      },
      appearances: {
        date_time_picker: {
          description: "Date and time picker interface",
          parameters: {},
          example: {
            editor: "date_time_picker",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "String in format YYYY-MM-DDTHH:MM:SS",
        example: "2023-07-15T14:30:00"
      },
      fullExample: {
        label: "Event Date/Time",
        api_key: "event_datetime",
        field_type: "date_time",
        hint: "Select the date and time of the event",
        appearance: {
          editor: "date_time_picker",
          parameters: {},
          addons: []
        },
        validators: {
          required: {}
        },
        default_value: "2023-07-15T14:30:00"
      }
    }
  },
  mediaFields: {
    file: {
      description: "Single file upload field",
      validators: {
        required: { description: "Makes the field required" },
        extension: { 
          description: "Restricts file types",
          example: { predefined_list: "image" },
          notes: "Options: \"image\", \"document\", \"video\", \"audio\""
        }
      },
      appearances: {
        file: {
          description: "File uploader interface",
          parameters: {},
          example: {
            editor: "file",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Not supported",
        notes: "Default values for file fields are not supported"
      },
      fullExample: {
        label: "Featured Image",
        api_key: "featured_image",
        field_type: "file",
        hint: "Upload the main image for this content (images only)",
        appearance: {
          editor: "file",
          parameters: {},
          addons: []
        },
        validators: {
          required: {},
          extension: { predefined_list: "image" }
        }
      }
    },
    gallery: {
      description: "Multiple file upload field",
      validators: {
        size: { description: "Validates number of items", example: { min: 2, max: 10 } },
        extension: { 
          description: "Restricts file types",
          example: { predefined_list: "image" }
        }
      },
      appearances: {
        gallery: {
          description: "Gallery/multiple file uploader interface",
          parameters: {},
          example: {
            editor: "gallery",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Not supported",
        notes: "Default values for gallery fields are not supported"
      },
      fullExample: {
        label: "Image Gallery",
        api_key: "image_gallery",
        field_type: "gallery",
        hint: "Upload 2-10 images for the gallery (images only)",
        appearance: {
          editor: "gallery",
          parameters: {},
          addons: []
        },
        validators: {
          size: { min: 2, max: 10 },
          extension: { predefined_list: "image" }
        }
      }
    },
    video: {
      description: "Video URL field (YouTube, Vimeo, etc.)",
      validators: {
        required: { description: "Makes the field required" }
      },
      appearances: {
        video: {
          description: "Video embed interface",
          parameters: {},
          example: {
            editor: "video",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Not supported",
        notes: "Default values for video fields are not supported"
      },
      fullExample: {
        label: "Featured Video",
        api_key: "featured_video",
        field_type: "video",
        hint: "Provide a video URL (YouTube, Vimeo, etc.)",
        appearance: {
          editor: "video",
          parameters: {},
          addons: []
        },
        validators: {
          required: {}
        }
      }
    }
  },
  specialFields: {
    boolean: {
      description: "True/false toggle field",
      validators: {},
      appearances: {
        boolean: {
          description: "Toggle switch interface",
          parameters: {},
          example: {
            editor: "boolean",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Boolean value",
        example: false
      },
      fullExample: {
        label: "Featured Item",
        api_key: "featured_item",
        field_type: "boolean",
        hint: "Should this item be featured on the homepage?",
        appearance: {
          editor: "boolean",
          parameters: {},
          addons: []
        },
        default_value: false
      }
    },
    lat_lon: {
      description: "Geographic location (latitude/longitude) field",
      validators: {
        required: { description: "Makes the field required" }
      },
      appearances: {
        lat_lon_editor: {
          description: "Map location picker interface",
          parameters: {},
          example: {
            editor: "lat_lon_editor",
            parameters: {},
            addons: []
          },
          notes: "Use editor: 'lat_lon_editor', not 'map' as in some documentation"
        }
      },
      defaultValue: {
        description: "Not well supported",
        notes: "Default values for location fields are not well supported"
      },
      fullExample: {
        label: "Event Location",
        api_key: "event_location",
        field_type: "lat_lon",
        hint: "Select the geographical location for this event",
        appearance: {
          editor: "lat_lon_editor",
          parameters: {},
          addons: []
        },
        validators: {
          required: {}
        }
      }
    },
    color: {
      description: "Color picker field",
      validators: {
        required: { description: "Makes the field required" }
      },
      appearances: {
        color_picker: {
          description: "Color picker interface",
          parameters: {
            enable_alpha: { 
              description: "Enables transparency (MUST be set to false)",
              default: false,
              notes: "This parameter MUST be set to false to work properly"
            },
            preset_colors: { 
              description: "Array of preset hex color values",
              example: ["#FF0000", "#00FF00", "#0000FF"]
            }
          },
          example: {
            editor: "color_picker",
            parameters: {
              enable_alpha: false,
              preset_colors: ["#FF0000", "#00FF00", "#0000FF"]
            },
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Object with RGBA values",
        example: {
          red: 255,
          green: 0,
          blue: 0,
          alpha: 255
        }
      },
      fullExample: {
        label: "Primary Brand Color",
        api_key: "primary_brand_color",
        field_type: "color",
        hint: "Select the primary brand color (without transparency)",
        appearance: {
          editor: "color_picker",
          parameters: {
            enable_alpha: false,
            preset_colors: ["#FF0000", "#00FF00", "#0000FF"]
          },
          addons: []
        },
        validators: {
          required: {}
        },
        default_value: {
          red: 255,
          green: 0,
          blue: 0,
          alpha: 255
        }
      }
    }
  },
  seoFields: {
    slug: {
      description: "URL-friendly text field",
      validators: {
        required: { description: "Makes the field required" },
        unique: { description: "Ensures the slug is unique across all records of this type" }
      },
      appearances: {
        slug: {
          description: "Slug editor with URL preview",
          parameters: {
            url_prefix: { description: "URL prefix to display with the slug" },
            placeholder: { description: "Placeholder text shown when field is empty" }
          },
          example: {
            editor: "slug",
            parameters: {
              url_prefix: "https://example.com/",
              placeholder: "Enter slug here..."
            },
            addons: []
          }
        }
      },
      defaultValue: {
        description: "String value",
        example: "default-slug"
      },
      fullExample: {
        label: "Page Slug",
        api_key: "page_slug",
        field_type: "slug",
        hint: "URL-friendly identifier (used in the page URL)",
        localized: true,
        appearance: {
          editor: "slug",
          parameters: {
            url_prefix: "https://example.com/",
            placeholder: "Enter slug here..."
          },
          addons: []
        },
        validators: {
          required: {},
          unique: {}
        }
      }
    },
    seo: {
      description: "SEO metadata field (title, description, image)",
      validators: {},
      appearances: {
        seo: {
          description: "SEO metadata editor",
          parameters: {},
          example: {
            editor: "seo",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Not supported",
        notes: "Default values for SEO fields are not supported"
      },
      fullExample: {
        label: "SEO Metadata",
        api_key: "seo_metadata",
        field_type: "seo",
        hint: "Search engine optimization settings for this content",
        localized: true,
        appearance: {
          editor: "seo",
          parameters: {},
          addons: []
        }
      }
    }
  },
  referenceFields: {
    link: {
      description: "Reference to a single record",
      validators: {
        required: { description: "Makes the field required" },
        item_item_type: { 
          description: "Restricts which item types can be referenced (REQUIRED)",
          example: { item_types: ["model_id"] },
          notes: "You must provide an array of item type IDs to reference"
        }
      },
      appearances: {
        link_select: {
          description: "Record selector interface",
          parameters: {},
          example: {
            editor: "link_select",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Not supported",
        notes: "Default values for link fields are not supported"
      },
      fullExample: {
        label: "Primary Author",
        api_key: "primary_author",
        field_type: "link",
        hint: "Select the primary author of this content",
        appearance: {
          editor: "link_select",
          parameters: {},
          addons: []
        },
        validators: {
          required: {},
          item_item_type: {
            item_types: ["author_model_id"]
          }
        }
      }
    },
    links: {
      description: "References to multiple records",
      validators: {
        size: { description: "Validates number of references", example: { min: 0, max: 3 } },
        items_item_type: { 
          description: "Restricts which item types can be referenced (REQUIRED)",
          example: { item_types: ["model_id"] },
          notes: "You must provide an array of item type IDs to reference"
        }
      },
      appearances: {
        links_select: {
          description: "Multiple record selector interface",
          parameters: {},
          example: {
            editor: "links_select",
            parameters: {},
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Not supported",
        notes: "Default values for links fields are not supported"
      },
      fullExample: {
        label: "Co-Authors",
        api_key: "co_authors",
        field_type: "links",
        hint: "Select up to 3 co-authors if applicable",
        appearance: {
          editor: "links_select",
          parameters: {},
          addons: []
        },
        validators: {
          size: { min: 0, max: 3 },
          items_item_type: {
            item_types: ["author_model_id"]
          }
        }
      }
    }
  },
  structuredDataFields: {
    json: {
      description: "Flexible JSON data structure",
      validators: {
        required: { description: "Makes the field required" }
      },
      appearances: {
        json_editor: {
          description: "JSON code editor",
          parameters: {},
          example: {
            editor: "json_editor",
            parameters: {},
            addons: []
          },
          notes: "Use 'json_editor' as the editor name, not 'json'"
        },
        string_multi_select: {
          description: "Multi-select dropdown",
          parameters: {
            options: { description: "Array of options with label/value pairs" }
          },
          example: {
            editor: "string_multi_select",
            parameters: {
              options: [
                { label: "Technology", value: "technology" },
                { label: "Design", value: "design" }
              ]
            },
            addons: []
          }
        },
        string_checkbox_group: {
          description: "Checkbox group",
          parameters: {
            options: { 
              description: "Array of options with label/value pairs",
              notes: "IMPORTANT: Use 'options' parameter name, not 'checkboxes'"
            }
          },
          example: {
            editor: "string_checkbox_group",
            parameters: {
              options: [
                { label: "Premium Support", value: "premium_support" },
                { label: "Fast Delivery", value: "fast_delivery" }
              ]
            },
            addons: []
          }
        }
      },
      defaultValue: {
        description: "JSON object (as string)",
        example: JSON.stringify({
          enabled: true,
          config: {
            display: "full"
          }
        })
      },
      fullExample: {
        label: "Advanced Settings",
        api_key: "advanced_settings",
        field_type: "json",
        hint: "Enter JSON data for advanced configuration options",
        appearance: {
          editor: "json_editor",
          parameters: {},
          addons: []
        },
        validators: {
          required: {}
        },
        default_value: JSON.stringify({
          enabled: true,
          config: {
            display: "full",
            animation: {
              enabled: true,
              duration: 300
            }
          }
        })
      }
    },
    single_block: {
      description: "Single modular content block",
      validators: {
        required: { description: "Makes the field required" },
        single_block_blocks: { 
          description: "Restricts which block models can be used (REQUIRED)",
          example: { item_types: ["block_model_id1", "block_model_id2"] },
          notes: "You must provide an array of modular block item type IDs"
        }
      },
      appearances: {
        framed_single_block: {
          description: "Block editor with frame",
          parameters: {
            start_collapsed: { description: "Whether the block is initially collapsed", default: false }
          },
          example: {
            editor: "framed_single_block",
            parameters: { start_collapsed: false },
            addons: []
          }
        }
      },
      defaultValue: {
        description: "Not supported",
        notes: "Default values for single block fields are not supported"
      },
      fullExample: {
        label: "Hero Block",
        api_key: "hero_block",
        field_type: "single_block",
        hint: "Select a single content block to use as hero",
        appearance: {
          editor: "framed_single_block",
          parameters: { start_collapsed: false },
          addons: []
        },
        validators: {
          required: {},
          single_block_blocks: {
            item_types: ["text_block_id", "image_block_id", "quote_block_id"]
          }
        }
      }
    }
  }
};

/**
 * Enhanced handler for getting field type information with template support
 * This provides detailed documentation about field types and their supported configurations
 * along with working template examples
 */
export const getFieldTypeInfoHandler = async (args: { 
  apiToken: string;
  environment?: string;
  fieldType?: string;
  appearance?: string;
}): Promise<StandardResponse<any>> => {
  // Set default environment if not provided
  const environment = args.environment || "main";
  try {
    // Get the client
    const client = await getClient(args.apiToken, environment);
    
    // If a specific field template is requested
    if (args.fieldType && args.appearance) {
      const template = getFieldTemplate(args.fieldType, args.appearance);
      if (template) {
        return {
          success: true,
          data: {
            fieldType: args.fieldType,
            appearance: args.appearance,
            template,
            usage: "Use this template as a basis for your field creation request"
          },
          message: `Working template for ${args.fieldType} field with ${args.appearance} appearance`
        };
      } else {
        return {
          success: false,
          error: `No template found for ${args.fieldType} field with ${args.appearance} appearance. Available appearances: ${getAvailableAppearances(args.fieldType).join(', ')}`
        };
      }
    }
    
    // If just a field type is requested
    if (args.fieldType) {
      // First check if we have templates for this field type
      const appearances = getAvailableAppearances(args.fieldType);
      if (appearances.length > 0) {
        const templates: Record<string, any> = {};
        appearances.forEach(appearance => {
          if (args.fieldType) { // TS needs this check even though we already know fieldType exists
            templates[appearance] = getFieldTemplate(args.fieldType, appearance);
          }
        });
        
        return {
          success: true,
          data: {
            fieldType: args.fieldType,
            templates,
            appearances,
            usage: "Use these templates as a basis for your field creation requests"
          },
          message: `Working templates for ${args.fieldType} field. Available appearances: ${appearances.join(', ')}`
        };
      }
      
      // Fall back to documentation
      for (const category of Object.values(fieldTypeDocs) as Record<string, any>[]) {
        if (args.fieldType in category) {
          return {
            success: true,
            data: {
              fieldType: args.fieldType,
              ...category[args.fieldType]
            },
            message: `Detailed information for field type: ${args.fieldType}`
          };
        }
      }
      
      // Field type not found
      return {
        success: false,
        error: `Field type '${args.fieldType}' not found. Available field types: ${getAvailableFieldTypes().join(', ')}`
      };
    }
    
    // Return a summary of all available field templates
    const templateFieldTypes = getAvailableFieldTypes();
    const templateSummary: Record<string, any> = {};
    
    templateFieldTypes.forEach(fieldType => {
      templateSummary[fieldType] = {
        appearances: getAvailableAppearances(fieldType)
      };
    });
    
    return {
      success: true,
      data: {
        availableTemplates: templateSummary
      },
      message: `
FIELD CREATION TEMPLATES: Use these verified templates to avoid validation errors when creating fields.

🔴 CRITICAL REQUIREMENTS:

1. ALWAYS include 'addons: []' in appearance (mandatory but undocumented)
2. Use CORRECT editor names:
   - For locations: use "map" (not "lat_lon_editor")
   - For JSON: use "json_editor" (not "json")
   - For text: include appearance.addons even for "textarea"
3. String radio/select groups: enum validator values MUST match your option values exactly
4. JSON checkbox groups: use "options" parameter (not "checkboxes")
5. Color fields: set enable_alpha to false (required)
6. Slug fields: include required validators

📋 WORKING TEMPLATE EXAMPLES:

String Radio Group:
{
  "label": "Category",
  "api_key": "category",
  "field_type": "string",
  "appearance": {
    "editor": "string_radio_group",
    "parameters": {"radios": [{"label": "Option A", "value": "option_a"}]},
    "addons": []  /* ← REQUIRED! */
  },
  "validators": {
    "enum": {"values": ["option_a"]} /* ← MUST match values above exactly */
  }
}

Text Area:
{
  "label": "Description",
  "api_key": "description",
  "field_type": "text",
  "appearance": {
    "editor": "textarea",
    "parameters": {"placeholder": "Enter text..."},
    "addons": []  /* ← REQUIRED! */
  }
}

Location Field:
{
  "label": "Location",
  "api_key": "location",
  "field_type": "lat_lon",
  "appearance": {
    "editor": "map",  /* ← Use this, not "lat_lon_editor" */
    "parameters": {},
    "addons": []  /* ← REQUIRED! */
  }
}

JSON Field (Checkbox Group):
{
  "label": "Features",
  "api_key": "features",
  "field_type": "json",
  "appearance": {
    "editor": "string_checkbox_group",
    "parameters": {"options": [{"label": "Feature", "value": "feature"}]},  /* ← Use "options", not "checkboxes" */
    "addons": []  /* ← REQUIRED! */
  }
}

🔍 HOW TO USE:
- Get specific template: fieldType="string", appearance="string_radio_group"
- Get all templates for a type: fieldType="string"
- Get available field types: no parameters
`
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `Error retrieving field type information: ${errorMessage}`
    };
  }
};

/**
 * Helper function to get a flat list of all field types from documentation
 */
function getAllFieldTypes(): string[] {
  const types = [];
  
  for (const category of Object.values(fieldTypeDocs)) {
    types.push(...Object.keys(category));
  }
  
  return types;
}