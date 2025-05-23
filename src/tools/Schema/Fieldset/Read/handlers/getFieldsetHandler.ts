/**
 * @file getFieldsetHandler.ts
 * @description Handler for retrieving a specific fieldset by ID
 */

import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to retrieve a specific fieldset by ID
 */
export const getFieldsetHandler = createRetrieveHandler({
  domain: "schema.fieldset",
  schemaName: "get_fieldset",
  schema: schemaSchemas.get_fieldset,
  entityName: "Fieldset",
  idParam: "fieldsetId",
  clientAction: async (client, args) => {
    return await client.fieldsets.find(args.fieldsetId);
  }
});