/**
 * @file updateFieldsetHandler.ts
 * @description Handler for updating an existing fieldset in DatoCMS
 */

import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to update an existing fieldset in DatoCMS
 */
export const updateFieldsetHandler = createUpdateHandler({
  domain: "schema.fieldset",
  schemaName: "update_fieldset",
  schema: schemaSchemas.update_fieldset,
  entityName: "Fieldset",
  idParam: "fieldsetId",
  successMessage: "Fieldset updated successfully",
  clientAction: async (client, args) => {
    // Prepare fieldset data for update (only include fields that are provided)
    const fieldsetData: Record<string, unknown> = {};
    
    if (args.title !== undefined) fieldsetData.title = args.title;
    if (args.hint !== undefined) fieldsetData.hint = args.hint;
    if (args.position !== undefined) fieldsetData.position = args.position;
    if (args.collapsible !== undefined) fieldsetData.collapsible = args.collapsible;
    if (args.start_collapsed !== undefined) fieldsetData.start_collapsed = args.start_collapsed;
    
    return await client.fieldsets.update(args.fieldsetId, fieldsetData);
  }
});