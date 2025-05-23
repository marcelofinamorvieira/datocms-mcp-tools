import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { modelFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { ModelFilterCreateParams } from "../../../uiTypes.js";

/**
 * Handler for creating a new model filter
 */
export const createModelFilterHandler = createCreateHandler({
  domain: "ui.modelFilter",
  schemaName: "create",
  schema: modelFilterSchemas.create,
  entityName: "Model Filter",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);

    // Prepare the payload for creating a model filter
    const payload: ModelFilterCreateParams = {
      name: args.name,
      item_type_id: args.item_type,
      filter: args.filter,
      shared: args.shared
    };

    // Add optional fields if provided
    if (args.columns) payload.columns = args.columns;
    if (args.order_by) payload.order_by = args.order_by;

    // Create the model filter using the typed client
    return await typedClient.createModelFilter(payload);
  }
});