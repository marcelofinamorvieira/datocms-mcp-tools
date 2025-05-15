import { z } from "zod";
import { lazy } from "./lazySchema.js";
import { apiTokenSchema, environmentSchema, paginationSchema, fieldTypeSchema } from "./sharedSchemas.js";

/**
 * Schema registry for the DatoCMS MCP server
 * 
 * Provides a centralized registry of commonly used schemas
 * with lazy loading for improved performance.
 */

/**
 * Schema registry with lazy-loaded schemas
 */
export const schemaRegistry = {
  // Base schemas
  apiToken: lazy(() => apiTokenSchema),
  
  environment: lazy(() => environmentSchema),
  
  confirmation: lazy(() => z.boolean().optional()),
  
  // ID schemas
  recordId: lazy(() => z.string().min(1).describe(
    "The ID of the record to interact with."
  )),
  
  itemTypeId: lazy(() => z.string().min(1).describe(
    "The ID of the item type to interact with."
  )),
  
  fieldId: lazy(() => z.string().min(1).describe(
    "The ID of the field to interact with."
  )),
  
  fieldsetId: lazy(() => z.string().min(1).describe(
    "The ID of the fieldset to interact with."
  )),
  
  environmentId: lazy(() => z.string().min(1).describe(
    "The ID of the environment to interact with."
  )),
  
  webhookId: lazy(() => z.string().min(1).describe(
    "The ID of the webhook to interact with."
  )),
  
  buildTriggerId: lazy(() => z.string().min(1).describe(
    "The ID of the build trigger to interact with."
  )),
  
  collaboratorId: lazy(() => z.string().min(1).describe(
    "The ID of the collaborator to interact with."
  )),
  
  tokenId: lazy(() => z.string().min(1).describe(
    "The ID of the API token to interact with."
  )),
  
  uploadId: lazy(() => z.string().min(1).describe(
    "The ID of the upload to interact with."
  )),
  
  // Pagination schemas
  pagination: lazy(() => paginationSchema),
  
  // Field type schema
  fieldType: lazy(() => fieldTypeSchema)
};

/**
 * Basic list schema with common parameters
 */
export const basicList = z.object({
  apiToken: schemaRegistry.apiToken,
  environment: schemaRegistry.environment,
  page: schemaRegistry.pagination.optional()
});

/**
 * Basic get schema with common parameters
 */
export const basicGet = z.object({
  apiToken: schemaRegistry.apiToken,
  environment: schemaRegistry.environment
});

/**
 * Basic delete schema with common parameters
 */
export const basicDelete = z.object({
  apiToken: schemaRegistry.apiToken,
  environment: schemaRegistry.environment
});

/**
 * Type-safe schema factory for creating schemas with consistent base
 */
export function createSchema<T extends z.ZodRawShape>(
  shape: T
): z.ZodObject<T & { apiToken: z.ZodType; environment: z.ZodType<string | undefined> }> {
  return z.object({
    apiToken: schemaRegistry.apiToken,
    environment: schemaRegistry.environment,
    ...shape
  } as T & { apiToken: z.ZodType; environment: z.ZodType<string | undefined> });
}

/**
 * Domain-specific schema registries
 */
export const domainSchemas = {
  // Records domain
  records: {
    retrieve: lazy(() => createSchema({
      recordId: schemaRegistry.recordId
    })),
    
    delete: lazy(() => createSchema({
      recordId: schemaRegistry.recordId
    })),
    
    publish: lazy(() => createSchema({
      recordId: schemaRegistry.recordId
    })),
    
    unpublish: lazy(() => createSchema({
      recordId: schemaRegistry.recordId
    }))
  },
  
  // Schema domain
  schema: {
    itemType: {
      retrieve: lazy(() => createSchema({
        itemTypeId: schemaRegistry.itemTypeId
      })),
      
      delete: lazy(() => createSchema({
        itemTypeId: schemaRegistry.itemTypeId
      }))
    },
    
    field: {
      retrieve: lazy(() => createSchema({
        fieldId: schemaRegistry.fieldId
      })),
      
      delete: lazy(() => createSchema({
        fieldId: schemaRegistry.fieldId
      }))
    },
    
    fieldset: {
      retrieve: lazy(() => createSchema({
        fieldsetId: schemaRegistry.fieldsetId
      })),
      
      delete: lazy(() => createSchema({
        fieldsetId: schemaRegistry.fieldsetId
      }))
    }
  },
  
  // Environments domain
  environments: {
    retrieve: lazy(() => createSchema({
      environmentId: schemaRegistry.environmentId
    })),
    
    delete: lazy(() => createSchema({
      environmentId: schemaRegistry.environmentId
    })),
    
    promote: lazy(() => createSchema({
      environmentId: schemaRegistry.environmentId
    }))
  },
  
  // Webhooks domain
  webhooks: {
    retrieve: lazy(() => createSchema({
      webhookId: schemaRegistry.webhookId
    })),
    
    delete: lazy(() => createSchema({
      webhookId: schemaRegistry.webhookId
    }))
  },
  
  // Build triggers domain
  buildTriggers: {
    retrieve: lazy(() => createSchema({
      buildTriggerId: schemaRegistry.buildTriggerId
    })),
    
    delete: lazy(() => createSchema({
      buildTriggerId: schemaRegistry.buildTriggerId
    }))
  },
  
  // Collaborators domain
  collaborators: {
    retrieve: lazy(() => createSchema({
      collaboratorId: schemaRegistry.collaboratorId
    })),
    
    delete: lazy(() => createSchema({
      collaboratorId: schemaRegistry.collaboratorId
    }))
  },
  
  // API tokens domain
  tokens: {
    retrieve: lazy(() => createSchema({
      tokenId: schemaRegistry.tokenId
    })),
    
    delete: lazy(() => createSchema({
      tokenId: schemaRegistry.tokenId
    }))
  },
  
  // Uploads domain
  uploads: {
    retrieve: lazy(() => createSchema({
      uploadId: schemaRegistry.uploadId
    })),
    
    delete: lazy(() => createSchema({
      uploadId: schemaRegistry.uploadId
    }))
  }
}

export default {
  schemaRegistry,
  basicList,
  basicGet,
  basicDelete,
  createSchema,
  domainSchemas
};