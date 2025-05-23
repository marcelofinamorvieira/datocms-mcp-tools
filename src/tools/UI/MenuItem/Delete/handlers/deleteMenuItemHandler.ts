/**
 * @file deleteMenuItemHandler.ts
 * @description Handler for deleting a DatoCMS menu item
 */

import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { menuItemSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";

/**
 * Handler function for deleting a DatoCMS menu item
 */
export const deleteMenuItemHandler = createDeleteHandler({
  domain: "ui.menuItem",
  schemaName: "delete",
  schema: menuItemSchemas.delete,
  entityName: "Menu Item",
  idParam: "menuItemId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    try {
      // Delete the menu item with force parameter if provided
      await typedClient.deleteMenuItem(args.menuItemId, { force: args.force });
    } catch (error: unknown) {
      // Check if the error is related to having child menu items
      const errorMessage = extractDetailedErrorInfo(error);
      
      if (errorMessage.includes("has children")) {
        throw new Error(`Cannot delete menu item with ID '${args.menuItemId}' because it has children. Set 'force' to true to delete it along with all its children.`);
      }
      
      // Re-throw the error to be handled by the factory
      throw error;
    }
  }
});