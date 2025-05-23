/**
 * @file createSchemaMenuItemHandler.ts
 * @description Handler for creating a DatoCMS schema menu item
 */

import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaMenuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { SchemaMenuItemCreateParams } from "../../../uiTypes.js";

/**
 * Handler function for creating a DatoCMS schema menu item
 */
export const createSchemaMenuItemHandler = createCreateHandler({
  domain: "ui.schemaMenuItem",
  schemaName: "create",
  schema: schemaMenuItemSchemas.create,
  entityName: "Schema Menu Item",
  successMessage: (result: any) => `Successfully created schema menu item '${result.label}' with ID ${result.id}`,
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Create schema menu item payload
    const payload: any = {
      label: args.label,
      kind: "item_type" // This is required by the API but wasn't in the schema
    };

    // Add optional fields if they are defined
    if (args.position !== undefined) payload.position = args.position;
    if (args.parent_id !== undefined) payload.parent_id = args.parent_id;
    
    // Handle type-specific requirements
    if (args.type === "model" && args.attributes?.model_id) {
      payload.item_type_id = args.attributes.model_id;
    } else if (args.type === "model" && !args.attributes?.model_id) {
      throw new Error("model_id is required when type is 'model'");
    }
    
    // Create the schema menu item
    return await typedClient.createSchemaMenuItem(payload);
  }
});