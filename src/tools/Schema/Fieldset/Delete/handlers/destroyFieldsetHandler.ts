/**
 * @file destroyFieldsetHandler.ts
 * @description Handler for deleting a fieldset from DatoCMS
 */

import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to delete a fieldset from DatoCMS
 */
export const destroyFieldsetHandler = createDeleteHandler({
  domain: "schema.fieldset",
  schemaName: "delete_fieldset",
  schema: schemaSchemas.delete_fieldset,
  entityName: "Fieldset",
  idParam: "fieldsetId",
  clientAction: async (client, args) => {
    await client.fieldsets.destroy(args.fieldsetId);
  }
});