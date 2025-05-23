import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { modelFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler for retrieving a single model filter by ID
 */
export const retrieveModelFilterHandler = createRetrieveHandler({
  domain: "ui.modelFilter",
  schemaName: "retrieve",
  schema: modelFilterSchemas.retrieve,
  entityName: "Model Filter",
  idParam: "modelFilterId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);

    // Fetch the model filter by ID
    return await typedClient.findModelFilter(args.modelFilterId);
  }
});