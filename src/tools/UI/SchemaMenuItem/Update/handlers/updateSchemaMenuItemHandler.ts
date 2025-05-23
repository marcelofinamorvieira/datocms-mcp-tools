/**
 * @file updateSchemaMenuItemHandler.ts
 * @description Handler for updating a DatoCMS schema menu item
 */

import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaMenuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { SchemaMenuItemUpdateParams } from "../../../uiTypes.js";

/**
 * Handler function for updating a DatoCMS schema menu item
 */
export const updateSchemaMenuItemHandler = createUpdateHandler({
  domain: "ui.schemaMenuItem",
  schemaName: "update",
  schema: schemaMenuItemSchemas.update,
  entityName: "Schema Menu Item",
  idParam: "schemaMenuItemId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Create schema menu item update payload (only including defined fields)
    const payload: SchemaMenuItemUpdateParams = {};

    // Add fields only if they are defined
    if (args.label !== undefined) payload.label = args.label;
    if (args.position !== undefined) payload.position = args.position;
    if (args.parent_id !== undefined) payload.parent_id = args.parent_id;
    
    // Handle type-specific requirements
    if (args.type === "model" && args.attributes?.model_id) {
      payload.item_type_id = args.attributes.model_id;
    }
    
    // Update the schema menu item
    return await typedClient.updateSchemaMenuItem(args.schemaMenuItemId, payload);
  }
});