# DatoCMS MCP Schema Usage Guide

This document provides guidance and examples for using the DatoCMS MCP server schemas.

## Overview

The DatoCMS MCP server uses Zod for schema validation across all API operations. Schemas are organized by domain area and provide consistent validation patterns, helpful error messages, and documentation.

## Common Schema Patterns

### Authentication

All operations require an API token for authentication:

```typescript
{
  "apiToken": "da3c12345678901234567890123456"
}
```

### Environment Selection

Operations can target a specific environment:

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "environment": "staging"
}
```

### Pagination

List operations support consistent pagination:

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "page": {
    "offset": 0,  // Start from the first item (0-based)
    "limit": 100  // Return up to 100 items
  }
}
```

### ID References

Entity references use consistent ID formats:

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "recordId": "X9EOCrUwRaeP8Ted7V0a5A"
}
```

### Confirmation for Destructive Actions

Destructive operations require explicit confirmation:

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "recordId": "X9EOCrUwRaeP8Ted7V0a5A",
  "confirmation": true
}
```

## Domain-Specific Examples

### Records

#### Querying Records

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "modelId": "12345",
  "fields": {
    "title": { "matches": "welcome" },
    "published": { "eq": true },
    "count": { "gt": 10 }
  },
  "order_by": "title_ASC",
  "page": { "offset": 0, "limit": 10 }
}
```

#### Creating a Record

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "itemType": "12345",
  "data": {
    "title": { "en": "English Title", "es": "Spanish Title" },
    "content": { "en": "Content in English", "es": "Content in Spanish" },
    "published": true,
    "count": 5
  }
}
```

### Schema Management

#### Creating an Item Type

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "name": "Blog Post",
  "apiKey": "blog_post",
  "allLocalesRequired": false,
  "draftModeActive": true
}
```

#### Creating a Field

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "itemTypeId": "12345",
  "label": "Post Title",
  "api_key": "title",
  "field_type": "string",
  "localized": true,
  "validators": {
    "required": true,
    "length": { "min": 5, "max": 100 }
  },
  "appearance": {
    "editor": "single_line",
    "parameters": { "heading": true }
  }
}
```

### Webhooks

#### Creating a Webhook

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "name": "Content Update Notification",
  "url": "https://example.com/webhook",
  "headers": { "x-custom-header": "custom-value" },
  "events": ["create", "update", "publish"],
  "payload_format": "json",
  "triggers": ["item_type"]
}
```

### Build Triggers

#### Creating a Build Trigger

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "name": "Vercel Production Deploy",
  "adapter": "vercel",
  "adapter_settings": {
    "project_id": "prj_123456789",
    "deploy_hook_url": "https://api.vercel.com/v1/integrations/deploy/prj_123456789/WEBHOOK_TOKEN"
  },
  "indexing_enabled": true
}
```

### Uploads

#### Creating an Upload

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "url": "https://example.com/image.jpg",
  "tags": ["hero", "landscape"],
  "default_field_metadata": {
    "en": { "alt": "Mountain landscape", "title": "Mountain View" },
    "es": { "alt": "Paisaje de montaña", "title": "Vista de Montaña" }
  }
}
```

### Environments

#### Forking an Environment

```typescript
{
  "apiToken": "da3c12345678901234567890123456",
  "environmentId": "primary",
  "newId": "staging",
  "fast": false
}
```

## Validation Details

### Field Types

The following field types are supported:

- `boolean`: Boolean values (true/false)
- `color`: Color values
- `date`: Date values
- `date_time`: Date and time values
- `file`: Single file/media upload
- `float`: Decimal numbers
- `gallery`: Multiple files/media uploads
- `integer`: Whole numbers
- `json`: JSON data
- `lat_lon`: Geographic coordinates
- `link`: Single link to another record
- `links`: Multiple links to other records
- `rich_text`: Rich text content
- `seo`: SEO metadata
- `single_block`: Single block of modular content
- `slug`: URL-friendly string
- `string`: Short text
- `structured_text`: Structured text content
- `text`: Long text
- `video`: Video embed

### Common Error Patterns

The validation system provides helpful error messages for common issues:

- Missing required fields
- Invalid field types
- Value constraints (min/max)
- Pattern matching
- Field type-specific validation
- Consistency validation

## Advanced Usage

### Field Validators

Field validators are specific to field types. For example, a string field might have:

```typescript
"validators": {
  "required": true,
  "length": { "min": 5, "max": 100 },
  "pattern": { "predefined": "customPattern", "regex": "^[A-Z].*$" }
}
```

### Field Appearance

Field appearance controls how the field is displayed in the DatoCMS interface:

```typescript
"appearance": {
  "editor": "wysiwyg",
  "parameters": { "heading": true },
  "addons": [
    {
      "id": "spell-checker",
      "parameters": { "language": "en" }
    }
  ]
}
```

## Further Reading

For more details, see:
- [DatoCMS CMA API Documentation](https://www.datocms.com/docs/content-management-api)
- [Zod Documentation](https://github.com/colinhacks/zod)