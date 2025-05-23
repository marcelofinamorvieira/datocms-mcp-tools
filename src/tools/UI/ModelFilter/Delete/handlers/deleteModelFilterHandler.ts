import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { modelFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler for deleting a model filter
 */
export const deleteModelFilterHandler = createDeleteHandler({
  domain: "ui.modelFilter",
  schemaName: "delete",
  schema: modelFilterSchemas.delete,
  entityName: "Model Filter",
  idParam: "modelFilterId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);

    // Delete the model filter using the typed client
    await typedClient.deleteModelFilter(args.modelFilterId);
  }
});