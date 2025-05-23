/**
 * @file createFieldsetHandler.ts
 * @description Handler for creating a new fieldset in DatoCMS
 */

import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to create a new fieldset in DatoCMS
 */
export const createFieldsetHandler = createCreateHandler({
  domain: "schema.fieldset",
  schemaName: "create_fieldset",
  schema: schemaSchemas.create_fieldset,
  entityName: "Fieldset",
  successMessage: "Fieldset created successfully",
  clientAction: async (client, args) => {
    const fieldsetData = {
      title: args.title,
      hint: args.hint,
      position: args.position,
      collapsible: args.collapsible,
      start_collapsed: args.start_collapsed
    };

    return await client.fieldsets.create(
      args.itemTypeId,
      fieldsetData
    );
  }
});