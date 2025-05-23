import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { modelFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { z } from "zod";

/**
 * Handler for updating a model filter
 */
export const updateModelFilterHandler = createUpdateHandler({
  domain: "ui.modelFilter",
  schemaName: "update",
  schema: modelFilterSchemas.update,
  entityName: "Model Filter",
  idParam: "modelFilterId",
  clientAction: async (client, args: z.infer<typeof modelFilterSchemas.update>) => {
    const typedClient = createTypedUIClient(client);

    // Prepare the payload for updating the model filter
    // Note: columns and order_by are part of the schema but not in the type definition
    // We pass them directly to the API which accepts them
    const payload: any = {};

    // Add optional fields if provided
    if (args.name !== undefined) payload.name = args.name;
    if (args.filter !== undefined) {
      payload.filter = {
        type: "query",
        attributes: args.filter
      };
    }
    if (args.columns !== undefined) payload.columns = args.columns;
    if (args.order_by !== undefined) payload.order_by = args.order_by;
    if (args.shared !== undefined) payload.shared = args.shared;

    // Update the model filter using the typed client
    return await typedClient.updateModelFilter(args.modelFilterId, payload);
  }
});