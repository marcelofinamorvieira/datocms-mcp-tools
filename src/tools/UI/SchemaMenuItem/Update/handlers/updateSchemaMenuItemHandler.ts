/**
 * @file updateSchemaMenuItemHandler.ts
 * @description Handler for updating a DatoCMS schema menu item
 */

import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaMenuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { z } from "zod";

/**
 * Handler function for updating a DatoCMS schema menu item
 */
export const updateSchemaMenuItemHandler = createUpdateHandler({
  domain: "ui.schemaMenuItem",
  schemaName: "update",
  schema: schemaMenuItemSchemas.update,
  entityName: "Schema Menu Item",
  idParam: "schemaMenuItemId",
  clientAction: async (client, args: z.infer<typeof schemaMenuItemSchemas.update>) => {
    const typedClient = createTypedUIClient(client);
    
    // Create schema menu item update payload (only including defined fields)
    // Note: parent_id is part of the schema but not in the type definition
    // We pass it directly to the API which accepts it
    const payload: any = {};

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