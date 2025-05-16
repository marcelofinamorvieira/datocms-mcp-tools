/**
 * @file schemaInitializer.ts
 * @description Initializes all schemas in the schema registry for global access
 */

import { SchemaRegistry } from "./schemaRegistry.js";
import { recordsSchemas } from "../tools/Records/schemas.js";
import { schemaSchemas } from "../tools/Schema/schemas.js";
import { uiSchemas } from "../tools/UI/schemas.js";
import { projectSchemas } from "../tools/Project/schemas.js";
import { uploadsSchemas } from "../tools/Uploads/schemas.js";
import { environmentSchemas } from "../tools/Environments/schemas.js";

// Import webhook and build trigger schemas
import { 
  webhookSchemas, 
  webhookCallSchemas, 
  buildTriggerSchemas, 
  deployEventSchemas 
} from "../tools/WebhookAndBuildTriggerCallsAndDeploys/schemas.js";

// Import collaborator schemas
import { 
  collaboratorSchemas, 
  roleSchemas, 
  apiTokenSchemas 
} from "../tools/CollaboratorsRolesAndAPITokens/schemas.js";

/**
 * Initializes all schemas in the registry for improved discoverability and validation
 */
export function initializeSchemas(): void {
  try {
    // Register Records schemas
    SchemaRegistry.registerBulk("records", recordsSchemas);
    
    // Register Schema schemas (item types, fields, etc.)
    SchemaRegistry.registerBulk("schema", schemaSchemas);
    
    // Register UI schemas (menu items, etc.)
    SchemaRegistry.registerBulk("ui", uiSchemas);
    
    // Register Project schemas
    SchemaRegistry.registerBulk("project", projectSchemas);
    
    // Register Uploads schemas
    SchemaRegistry.registerBulk("uploads", uploadsSchemas);
    
    // Register Environment schemas
    SchemaRegistry.registerBulk("environments", environmentSchemas);
    
    // Register Webhook and Delivery schemas 
    SchemaRegistry.registerBulk("webhooks", webhookSchemas);
    SchemaRegistry.registerBulk("webhook_calls", webhookCallSchemas);
    SchemaRegistry.registerBulk("build_triggers", buildTriggerSchemas);
    SchemaRegistry.registerBulk("deploy_events", deployEventSchemas);
    
    // Register Collaborator and Permissions schemas
    SchemaRegistry.registerBulk("collaborators", collaboratorSchemas);
    SchemaRegistry.registerBulk("roles", roleSchemas);
    SchemaRegistry.registerBulk("api_tokens", apiTokenSchemas);
    
    console.error("All schemas registered successfully");
  } catch (error) {
    console.error("Error registering schemas:", error);
  }
}

export default initializeSchemas;