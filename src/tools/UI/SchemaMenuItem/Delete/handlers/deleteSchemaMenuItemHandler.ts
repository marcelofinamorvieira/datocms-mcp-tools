/**
 * @file deleteSchemaMenuItemHandler.ts
 * @description Handler for deleting a DatoCMS schema menu item
 */

import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaMenuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";

/**
 * Handler function for deleting a DatoCMS schema menu item
 */
export const deleteSchemaMenuItemHandler = createDeleteHandler({
  domain: "ui.schemaMenuItem",
  schemaName: "delete",
  schema: schemaMenuItemSchemas.delete,
  entityName: "Schema Menu Item",
  idParam: "schemaMenuItemId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    try {
      // Delete the schema menu item
      await typedClient.deleteSchemaMenuItem(args.schemaMenuItemId);
    } catch (error: unknown) {
      // Check if the error is related to having child menu items
      const errorMessage = extractDetailedErrorInfo(error);
      
      if (errorMessage.includes("has children")) {
        throw new Error(`Cannot delete schema menu item with ID '${args.schemaMenuItemId}' because it has children.`);
      }
      
      // Re-throw the error to be handled by the factory
      throw error;
    }
  }
});