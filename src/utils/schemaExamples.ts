/**
 * @file schemaExamples.ts
 * @description Example values for schema documentation
 * @module utils
 *
 * Provides example values for various schema types to help with documentation and usage guidance.
 */

/**
 * API Token examples
 */
export const apiTokenExamples = {
  valid: "da3c12345678901234567890123456",
  invalid: "not-a-valid-token"
};

/**
 * Environment ID examples
 */
export const environmentExamples = {
  valid: "staging",
  valid2: "development",
  invalid: "Invalid Environment!"
};

/**
 * Pagination examples
 */
export const paginationExamples = {
  default: { offset: 0, limit: 100 },
  custom: { offset: 50, limit: 25 },
  maxLimit: { offset: 0, limit: 500 },
  invalid: { offset: -1, limit: 1000 }
};

/**
 * ID examples
 */
export const idExamples = {
  record: "X9EOCrUwRaeP8Ted7V0a5A",
  itemType: "12345",
  field: "78910"
};

/**
 * Role reference examples
 */
export const roleReferenceExamples = {
  predefined: "admin",
  roleId: "12345",
  objectReference: { id: "12345", type: "role" }
};

/**
 * Order by examples
 */
export const orderByExamples = {
  valid: "title_ASC",
  valid2: "updated_at_DESC",
  invalid: "title"
};

/**
 * Field type examples
 */
export const fieldTypeExamples = {
  text: "string",
  longText: "text", 
  number: "integer",
  decimal: "float",
  richText: "rich_text",
  media: "file",
  boolean: "boolean"
};

/**
 * Record examples
 */
export const recordExamples = {
  createQuery: {
    apiToken: apiTokenExamples.valid,
    itemType: idExamples.itemType,
    data: {
      title: { en: "English Title", es: "Spanish Title" },
      content: { en: "Content in English", es: "Content in Spanish" },
      published: true,
      count: 5
    }
  },
  queryFilter: {
    apiToken: apiTokenExamples.valid,
    modelId: idExamples.itemType,
    fields: {
      title: { matches: "welcome" },
      published: { eq: true },
      count: { gt: 10 }
    },
    order_by: "title_ASC",
    page: { offset: 0, limit: 10 }
  }
};

/**
 * Schema examples
 */
export const schemaExamples = {
  createItemType: {
    apiToken: apiTokenExamples.valid,
    name: "Blog Post",
    apiKey: "blog_post",
    allLocalesRequired: false,
    draftModeActive: true
  },
  createField: {
    apiToken: apiTokenExamples.valid,
    itemTypeId: idExamples.itemType,
    label: "Post Title",
    api_key: "title",
    field_type: "string",
    localized: true,
    validators: {
      required: true,
      length: { min: 5, max: 100 }
    },
    appearance: {
      editor: "single_line",
      parameters: { heading: true }
    }
  }
};

/**
 * Webhook examples
 */
export const webhookExamples = {
  create: {
    apiToken: apiTokenExamples.valid,
    name: "Content Update Notification",
    url: "https://example.com/webhook",
    headers: { "x-custom-header": "custom-value" },
    events: ["create", "update", "publish"],
    payload_format: "json",
    triggers: ["item_type"]
  }
};

/**
 * Build trigger examples
 */
export const buildTriggerExamples = {
  create: {
    apiToken: apiTokenExamples.valid,
    name: "Vercel Production Deploy",
    adapter: "vercel",
    adapter_settings: {
      project_id: "prj_123456789",
      deploy_hook_url: "https://api.vercel.com/v1/integrations/deploy/prj_123456789/WEBHOOK_TOKEN"
    },
    indexing_enabled: true
  }
};

/**
 * Upload examples
 */
export const uploadExamples = {
  create: {
    apiToken: apiTokenExamples.valid,
    url: "https://example.com/image.jpg",
    tags: ["hero", "landscape"],
    default_field_metadata: {
      en: { alt: "Mountain landscape", title: "Mountain View" },
      es: { alt: "Paisaje de montaña", title: "Vista de Montaña" }
    }
  }
};

/**
 * Environment examples
 */
export const environmentExamplesFull = {
  fork: {
    apiToken: apiTokenExamples.valid,
    environmentId: "primary",
    newId: "staging",
    fast: false
  }
};

/**
 * Full example collection
 */
export const examples = {
  apiToken: apiTokenExamples,
  environment: environmentExamples,
  pagination: paginationExamples,
  id: idExamples,
  roleReference: roleReferenceExamples,
  orderBy: orderByExamples,
  fieldType: fieldTypeExamples,
  record: recordExamples,
  schema: schemaExamples,
  webhook: webhookExamples,
  buildTrigger: buildTriggerExamples,
  upload: uploadExamples,
  environmentFull: environmentExamplesFull
};

export default examples;