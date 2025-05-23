# DatoCMS Field Creation Guide

This guide provides detailed information about creating fields in DatoCMS using the MCP server. It includes common patterns, troubleshooting tips, and recommended configurations for various field types.

## Getting Field Type Templates

The MCP server provides a helper to get templates for various field types and appearances:

```javascript
{
  "action": "get_field_type_info",
  "args": {
    "apiToken": "your_api_token",
    "fieldType": "string",
    "appearance": "string_radio_group"
  }
}
```

This will return a working template that you can use as a basis for your field creation.

## CRITICAL API PAYLOAD STRUCTURE REQUIREMENTS (NEW)

### MCP Field Creation Format

When using the MCP server to create fields, use this format:

```javascript
{
  "action": "create_field",
  "args": {
    "apiToken": "your_api_token",
    "itemTypeId": "your_item_type_id",
    "label": "Field Label",
    "api_key": "field_api_key",
    "field_type": "string",
    "appearance": {
      "editor": "single_line",
      "parameters": {},
      "addons": []  // ALWAYS required
    },
    "validators": {},
    "hint": "Optional help text",
    "localized": false
  }
}
```

### MCP-to-DatoCMS Translation

The MCP server internally transforms your request into the DatoCMS API v3 format which requires this structure:

```javascript
{
  "type": "field",
  "attributes": {
    "label": "Field Label",
    "api_key": "field_api_key",
    "field_type": "string",
    "appearance": {
      "editor": "single_line",
      "parameters": {},
      "addons": []
    },
    "validators": {},
    "hint": "Optional help text",
    "localized": false
  }
}
```

### Common Issues and Solutions

1. **Field Creation Errors**: If you're experiencing field creation errors, ensure that:
   - The `appearance.addons` array is always included (even if empty)
   - The `appearance.editor` value is compatible with the field type
   - Required validators for specific field types are included

2. **Location Fields**: For location fields, always use `"editor": "map"` (not "lat_lon_editor")

3. **Radio/Select Fields**: For string fields with radio or select appearance, ensure the `enum` validator has values that exactly match your options

4. **Model API Keys**: When creating models, use singular `api_key` values. For example `all_field_type` instead of `all_field_types`.

5. **Modular Block Models**: Set `draftModeActive` to `false` when creating modular block item types. Setting it to `true` will fail validation.

6. **Single Line String Fields**: Include `heading: false` in the appearance parameters.

7. **Rich Text Fields**: Always include a `rich_text_blocks` validator **with the block item type IDs allowed in the field**. The `item_types` array can include one or more IDs. Example: `{ "rich_text_blocks": { "item_types": ["block_model_id1", "block_model_id2"] } }`.

8. **Structured Text Fields**: Must include both `structured_text_blocks` and `structured_text_links` validators.

9. **Single Block Fields**: Use the validator `single_block_blocks` (not `single_block_type`).

10. **Link and Links Fields**: The referenced models must exist before creating these fields.

11. **Slug Fields**: Require a `slug_title_field` validator referencing the title field.

12. The `required` validator is not supported on `gallery`, `links`, or `rich_text` fields. Remove it when creating these field types.
13. **Prefer a Modular Approach**: When adding many fields to a model, favor a modular structure. Use link fields, block models, and structured text with blocks whenever possible. This keeps your schema flexible and provides a better editing experience.

## Critical Requirements for All Fields

1. **Appearance Structure**: All field appearances must have this structure:
   ```javascript
   "appearance": {
     "editor": "single_line",  // Editor name varies by field type
     "parameters": {},         // Parameters vary by editor, but always include this object
     "addons": []              // Always include this empty array
   }
   ```

2. **Validator Requirements**: Different field types require specific validators:
   - `string` with `string_radio_group` or `string_select` appearance requires the `enum` validator with values matching the options
   - `link` and `links` fields require `item_item_type` validator with an array of item type IDs
   - `json` field with `string_multi_select` or `string_checkbox_group` requires properly structured options

3. **Editor Names**: Some editor names have important requirements:
   - For `lat_lon` fields, the correct API editor name is `"map"` not `"lat_lon_editor"`
   - For `json` fields, prefer `"string_multi_select"` or `"string_checkbox_group"` editors; `json_editor` often fails
   - For `link` fields, use `"editor": "link_select"` 
   - For `links` fields, use `"editor": "links_select"`

## Common Field Types and Their Appearances

### String Fields

1. **Single Line**:
   ```javascript
   {
     "label": "Single Line String",
     "api_key": "single_line_string",
     "field_type": "string",
     "appearance": {
       "editor": "single_line",
       "parameters": { "heading": false },
       "addons": []
     },
     "validators": { "required": {} }
   }
   ```

2. **Radio Group**:
   ```javascript
   {
     "label": "Radio Group String",
     "api_key": "radio_group_string",
     "field_type": "string",
     "appearance": {
       "editor": "string_radio_group",
       "parameters": {
         "radios": [
           { "label": "Option A", "value": "option_a" }, 
           { "label": "Option B", "value": "option_b" }
         ]
       },
       "addons": []
     },
     "validators": {
       "required": {},
       "enum": { "values": ["option_a", "option_b"] }
     }
   }
   ```

3. **Select Dropdown**:
   ```javascript
   {
     "label": "String Select",
     "api_key": "string_select",
     "field_type": "string",
     "appearance": {
       "editor": "string_select",
       "parameters": {
         "options": [
           { "label": "Option A", "value": "option_a" },
           { "label": "Option B", "value": "option_b" }
         ]
       },
       "addons": []
     },
     "validators": {
       "required": {},
       "enum": { "values": ["option_a", "option_b"] }
     }
   }
   ```

### Text Fields

1. **Textarea**:
   ```javascript
   {
     "label": "Description Textarea",
     "api_key": "description_textarea",
     "field_type": "text",
     "appearance": {
       "editor": "textarea",
       "parameters": {
         "placeholder": "Enter detailed description here..."
       },
       "addons": []
     },
     "validators": { "required": {} }
   }
   ```

2. **WYSIWYG**:
   ```javascript
   {
     "label": "WYSIWYG Content",
     "api_key": "wysiwyg_content",
     "field_type": "text",
     "appearance": {
       "editor": "wysiwyg",
       "parameters": {},
       "addons": []
     },
     "validators": { "required": {} }
   }
   ```

### Location Fields

```javascript
{
  "label": "Event Location",
  "api_key": "event_location",
  "field_type": "lat_lon",
  "appearance": {
    "editor": "map",  // IMPORTANT: use "map", not "lat_lon_editor"
    "parameters": {},
    "addons": []
  },
  "validators": { "required": {} }
}
```

### Color Fields

Color fields must use the `color_picker` editor. The API requires the
`enable_alpha` parameter to be explicitly set to `false`.

```javascript
{
  "label": "Brand Color",
  "api_key": "brand_color",
  "field_type": "color",
  "appearance": {
    "editor": "color_picker",
    "parameters": { "enable_alpha": false },
    "addons": []
  },
  "validators": { "required": {} }
}
```

### SEO Fields

1. **Slug**:
   ```javascript
   {
     "label": "Page Slug",
     "api_key": "page_slug",
     "field_type": "slug",
     "appearance": {
       "editor": "slug",
       "parameters": {
         "url_prefix": "https://example.com/",
         "placeholder": "Enter slug here..."
       },
       "addons": []
     },
     "validators": {
       "required": {},
       "unique": {}
      "slug_title_field": { "title_field_id": "title_field_id" }
     }
   }
   ```

2. **SEO Metadata**:
   ```javascript
   {
     "label": "SEO Metadata",
     "api_key": "seo_metadata",
     "field_type": "seo",
     "appearance": {
       "editor": "seo",
       "parameters": {},
       "addons": []
     }
   }
   ```

### JSON Fields

1. **JSON Editor**:
   ```javascript
   {
     "label": "Advanced Settings",
     "api_key": "advanced_settings",
     "field_type": "json",
     "appearance": {
       "editor": "json_editor",
       "parameters": {},
       "addons": []
     },
   "validators": { "required": {} }
  }
  ```

### Rich Text Fields

Rich text fields require the `rich_text_blocks` validator. The appearance uses
the `start_collapsed` parameter (do **not** use `blocks_start_collapsed`, which
is for structured text fields).

```javascript
{
  "label": "Rich Text Content",
  "api_key": "rich_text_content",
  "field_type": "rich_text",
  "appearance": {
    "editor": "rich_text",
    "parameters": { "start_collapsed": false },
    "addons": []
  },
  "validators": {
    "rich_text_blocks": { "item_types": ["block_model_id1", "block_model_id2"] }
  }
}
```
### Structured Text Fields

Structured text fields require specific validators and parameters.

```javascript
{
  "label": "Structured Content",
  "api_key": "structured_content",
  "field_type": "structured_text",
  "appearance": {
    "editor": "structured_text",
    "parameters": {
      "blocks_start_collapsed": false,
      "show_links_target_blank": true,
      "show_links_meta_editor": true
    },
    "addons": []
  },
  "validators": {
    "structured_text_blocks": { "item_types": [] },
    "structured_text_links": { "item_types": [] }
  }
}
```

   *Note*: Despite being documented, the `json_editor` appearance is often rejected by the API. Use one of the other appearances if you encounter validation errors.

2. **Multi-Select**:
   ```javascript
   {
     "label": "Content Tags",
     "api_key": "content_tags",
     "field_type": "json",
     "appearance": {
       "editor": "string_multi_select",
       "parameters": {
         "options": [
           { "label": "Technology", "value": "technology" },
           { "label": "Design", "value": "design" }
         ]
       },
       "addons": []
     },
     "validators": { "required": {} }
   }
   ```

3. **Checkbox Group**:
   ```javascript
   {
     "label": "Features",
     "api_key": "features",
     "field_type": "json",
     "appearance": {
       "editor": "string_checkbox_group",
       "parameters": {
         "options": [
           { "label": "Premium Support", "value": "premium_support" },
           { "label": "Fast Delivery", "value": "fast_delivery" }
         ]
       },
       "addons": []
     },
    "validators": { "required": {} }
  }
  ```

### Single Block Fields

Single block fields allow editors to select a single modular block record. The `start_collapsed` parameter controls whether the block editor is collapsed by default.

```javascript
{
  "label": "Hero Block",
  "api_key": "hero_block",
  "field_type": "single_block",
  "appearance": {
    "editor": "framed_single_block",
    "parameters": { "start_collapsed": false },
    "addons": []
  },
  "validators": {
    "single_block_blocks": { "item_types": [] }
  }
}
```

## Reference Fields

Reference fields point to other item types. Ensure the target models are created
before you add a link or links field referencing them.

1. **Single Link**:
   ```javascript
   {
     "label": "Primary Author",
     "api_key": "primary_author",
     "field_type": "link",
     "appearance": {
       "editor": "link_select",
       "parameters": {},
       "addons": []
     },
     "validators": {
       "required": {},
       "item_item_type": {
         "item_types": ["author_model_id"]
       }
     }
   }
   ```

2. **Multiple Links**:
   ```javascript
   {
     "label": "Co-Authors",
     "api_key": "co_authors",
     "field_type": "links",
     "appearance": {
       "editor": "links_select",
       "parameters": {},
       "addons": []
     },
     "validators": {
       "size": { "min": 0, "max": 3 },
       "items_item_type": {
         "item_types": ["author_model_id"]
       }
     }
   }
   ```

## Troubleshooting Tips

1. **Common Validation Errors**:
   - Missing `addons` array in appearance
   - Missing or mismatched `enum` validator values for dropdown/radio fields
   - Using the wrong editor name for certain field types
   - Parameter structure issues (e.g., using `checkboxes` instead of `options`)
   - Applying the `required` validator to `gallery`, `links`, or `rich_text` fields

2. **Default Values**:
   - Avoid setting default values for localized fields
   - Some field types don't support default values (file, gallery, links, etc.)
   - Default values for JSON fields need to be valid JSON strings

3. **Field Appearance Issues**:
   - Always check the editor name is correct for the field type
   - Ensure parameters match exactly what the API expects
   - When in doubt, use the field type helper to get verified templates

## Best Practices

1. **API Keys**:
   - Use snake_case for API keys
   - Start with a lowercase letter
   - Use only letters, numbers, and underscores

2. **Localization**:
   - Set `localized: true` for content that needs translation
   - Be aware default values can cause issues with localized fields

3. **Field Organization**:
   - Use fieldsets to group related fields
   - Set appropriate positions to control display order
   - Add helpful hints to guide content editors