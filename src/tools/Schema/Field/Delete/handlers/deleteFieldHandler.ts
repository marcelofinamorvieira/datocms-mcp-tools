import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";

/**
 * Deletes a field from a DatoCMS item type
 */
export const deleteFieldHandler = createDeleteHandler({
  domain: "schema",
  schemaName: "delete_field",
  schema: schemaSchemas.delete_field,
  entityName: "Field",
  idParam: "fieldId",
  clientAction: async (client, args) => {
    // First, get the field to return its info later
    const field = await client.fields.find(args.fieldId);
    
    // Delete the field
    await client.fields.destroy(args.fieldId);
  },
  successMessage: (args) => {
    return `Field with ID '${args.fieldId}' deleted successfully.`;
  }
});