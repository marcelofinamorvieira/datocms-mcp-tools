import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { modelFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { ModelFilterUpdateParams } from "../../../uiTypes.js";

/**
 * Handler for updating a model filter
 */
export const updateModelFilterHandler = createUpdateHandler({
  domain: "ui.modelFilter",
  schemaName: "update",
  schema: modelFilterSchemas.update,
  entityName: "Model Filter",
  idParam: "modelFilterId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);

    // Prepare the payload for updating the model filter
    const payload: ModelFilterUpdateParams = {};

    // Add optional fields if provided
    if (args.name !== undefined) payload.name = args.name;
    if (args.filter !== undefined) payload.filter = args.filter;
    if (args.columns !== undefined) payload.columns = args.columns;
    if (args.order_by !== undefined) payload.order_by = args.order_by;
    if (args.shared !== undefined) payload.shared = args.shared;

    // Update the model filter using the typed client
    return await typedClient.updateModelFilter(args.modelFilterId, payload);
  }
});