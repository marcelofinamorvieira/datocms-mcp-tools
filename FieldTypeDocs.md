# DatoCMS Field Types: Complete Implementation Guide

This document provides a practical guide for creating all available field types in DatoCMS using the Content Management API. It's based on extensive testing to determine which configurations actually work, rather than just what's documented.

## Critical Requirements for All Fields

1. **Required for all fields with appearance:**
   - The `addons: []` property is **mandatory** for any field with an appearance object
   - Omitting this will cause API errors

2. **Parameters object:**
   - Even if you have no parameters, include an empty object: `parameters: {}`
   - Don't leave this property out of appearance objects

3. **Default values:**
   - Default values for localized fields often cause errors
   - Many field types don't support default values reliably

## Text Fields

### String Field (`string`)

**Valid Validators:**
- `required: {}`
- `length: { min: n, max: m }`
- `enum: { values: ["value1", "value2"] }`

**Presentation Options:**

1. **Single Line (`single_line`):**
   ```javascript
   appearance: {
     editor: "single_line",
     parameters: {
       heading: false
     },
     addons: []
   }
   ```
   - The `heading` parameter controls visual prominence
   - DO NOT use `placeholder` parameter despite documentation

2. **Radio Group (`string_radio_group`):**
   ```javascript
   appearance: {
     editor: "string_radio_group",
     parameters: {
       radios: [
         { label: "Blog Post", value: "blog_post" },
         { label: "News Article", value: "news_article" }
       ]
     },
     addons: []
   }
   ```
   - Values in `radios` array should match values in `enum` validator
   - Required when using this editor: `enum` validator with matching values

3. **Dropdown Select (`string_select`):**
   ```javascript
   appearance: {
     editor: "string_select",
     parameters: {
       options: [
         { label: "Technology", value: "technology" },
         { label: "Marketing", value: "marketing" }
       ]
     },
     addons: []
   }
   ```
   - Values in `options` array should match values in `enum` validator
   - Required when using this editor: `enum` validator with matching values

**Default Values:**
- For non-localized fields: `default_value: "Default Title"`
- For localized fields: avoid setting default values, can cause errors

**Complete Example:**
```javascript
await createField(model, {
  label: "Single Line Title",
  api_key: "single_line_title",
  field_type: "string",
  hint: "Enter the content title (minimum 5 characters, maximum 100)",
  localized: true,
  appearance: {
    editor: "single_line",
    parameters: {
      heading: false
    },
    addons: []
  },
  validators: {
    required: {},
    length: {
      min: 5,
      max: 100
    }
  }
});
```

### Text Field (`text`)

**Valid Validators:**
- `required: {}`

**Presentation Options:**

1. **Textarea (`textarea`):**
   ```javascript
   appearance: {
     editor: "textarea",
     parameters: {
       placeholder: "Enter detailed description here..."
     },
     addons: []
   }
   ```
   - The `placeholder` parameter is supported
   - DO NOT use `rows` parameter despite documentation

2. **WYSIWYG (`wysiwyg`):**
   ```javascript
   appearance: {
     editor: "wysiwyg",
     parameters: {},
     addons: []
   }
   ```
   - DO NOT use `toolbar` parameter despite documentation

3. **Markdown (`markdown`):**
   ```javascript
   appearance: {
     editor: "markdown",
     parameters: {},
     addons: []
   }
   ```

**Default Values:**
- Default values for text fields are not well supported
- Avoid using them, especially for localized fields

**Complete Example:**
```javascript
await createField(model, {
  label: "Description Textarea",
  api_key: "description_textarea",
  field_type: "text",
  hint: "Provide a detailed description of the content",
  localized: true,
  appearance: {
    editor: "textarea",
    parameters: {
      placeholder: "Enter detailed description here..."
    },
    addons: []
  },
  validators: {
    required: {}
  }
});
```

## JSON Field

**Field Type:** `json`

**Valid Validators:**
- `required: {}`

**Presentation Options:**

1. **JSON Editor (`json_editor`):**
   ```javascript
   appearance: {
     editor: "json_editor",
     parameters: {},
     addons: []
   }
   ```
   - DO NOT use `min_lines` or `max_lines` parameters despite documentation
   - ⚠️ The API often rejects `json_editor` as invalid. Prefer one of the other appearances.

2. **Multi-Select Dropdown (`string_multi_select`):**
   ```javascript
   appearance: {
     editor: "string_multi_select",
     parameters: {
       options: [
         { label: "Technology", value: "technology" },
         { label: "Design", value: "design" }
       ]
     },
     addons: []
   }
   ```

3. **Checkbox Group (`string_checkbox_group`):**
   ```javascript
   appearance: {
     editor: "string_checkbox_group",
     parameters: {
       options: [ // IMPORTANT: Use 'options' not 'checkboxes'
         { label: "Premium Support", value: "premium_support" },
         { label: "Fast Delivery", value: "fast_delivery" }
       ]
     },
     addons: []
   }
   ```
   - IMPORTANT: Use parameter name `options` (not `checkboxes` as mentioned in some docs)

**Default Values:**
- For `json` editor: A valid JSON object (as string)
  ```javascript
  default_value: JSON.stringify({
    enabled: true,
    config: {
      display: "full"
    }
  })
  ```
- Default values for `string_multi_select` and `string_checkbox_group` are not well supported

**Complete Example:**
```javascript
await createField(model, {
  label: "Advanced Settings",
  api_key: "advanced_settings",
  field_type: "json",
  hint: "Enter JSON data for advanced configuration options",
  appearance: {
    editor: "string_checkbox_group",
    parameters: {
      options: [
        { label: "Feature A", value: "feature_a" },
        { label: "Feature B", value: "feature_b" }
      ]
    },
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
});
```

## Location Field (Latitude/Longitude)

**Field Type:** `lat_lon`

**Valid Validators:**
- `required: {}`

**Presentation Options:**
```javascript
appearance: {
  editor: "map",  // Use 'map' with the API (not 'lat_lon_editor')
  parameters: {},
  addons: []
}
```
- DO NOT use `default_center` or `default_zoom` parameters despite documentation

**Default Values:**
- Default values for location fields are not well supported

**Complete Example:**
```javascript
await createField(model, {
  label: "Event Location",
  api_key: "event_location",
  field_type: "lat_lon",
  hint: "Select the geographical location for this event",
  appearance: {
    editor: "map",
    parameters: {},
    addons: []
  },
  validators: {
    required: {}
  }
});
```

## SEO Fields

### Slug Field

**Field Type:** `slug`

**Valid Validators:**
- `required: {}`
- `unique: {}`

**Presentation Options:**
```javascript
appearance: {
  editor: "slug",
  parameters: {
    url_prefix: "https://example.com/",
    placeholder: "Enter slug here..."
  },
  addons: []
}
```
- The `url_prefix` and `placeholder` parameters ARE supported

**Default Values:**
- String value: `default_value: "default-slug"`

**Complete Example:**

```javascript
await createField(model, {
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
});
```

## Structured Text Field

**Field Type:** `structured_text`

**Required Validators:**
 - `structured_text_blocks`
 - `structured_text_links`

**Presentation Options:**

```javascript
appearance: {
  editor: "structured_text",
  parameters: { blocks_start_collapsed: false },
  addons: []
}
```

**Complete Example:**

```javascript
await createField(model, {
  label: "Structured Content",
  api_key: "structured_content",
  field_type: "structured_text",
  appearance: {
    editor: "structured_text",
    parameters: { blocks_start_collapsed: false },
    addons: []
  },
  validators: {
    structured_text_blocks: { item_types: [] },
    structured_text_links: { item_types: [] }
  }
});
```

## Using the FieldCreationHelper

The project implements a `FieldCreationHelper` feature that provides verified templates for all field types. You can access it using the `get_field_type_info` action:

```javascript
// Get all available templates
{
  action: "get_field_type_info",
  args: {
    apiToken: "your-api-token"
  }
}

// Get templates for a specific field type
{
  action: "get_field_type_info",
  args: {
    apiToken: "your-api-token",
    fieldType: "json"
  }
}

// Get a specific template
{
  action: "get_field_type_info",
  args: {
    apiToken: "your-api-token",
    fieldType: "string",
    appearance: "string_radio_group"
  }
}
```

This will return validated templates that work with the DatoCMS API, helping to avoid common validation errors.