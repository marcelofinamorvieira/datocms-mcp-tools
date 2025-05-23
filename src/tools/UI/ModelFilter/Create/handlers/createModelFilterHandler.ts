import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { modelFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { z } from "zod";

/**
 * Handler for creating a new model filter
 */
export const createModelFilterHandler = createCreateHandler({
  domain: "ui.modelFilter",
  schemaName: "create",
  schema: modelFilterSchemas.create,
  entityName: "Model Filter",
  successMessage: (result: any) => `Successfully created model filter '${result.name}' with ID ${result.id}`,
  clientAction: async (client, args: z.input<typeof modelFilterSchemas.create>) => {
    const typedClient = createTypedUIClient(client);

    // Prepare the payload for creating a model filter
    // Note: columns and order_by are part of the schema but not in the type definition
    // We pass them directly to the API which accepts them
    const payload: any = {
      name: args.name,
      item_type_id: args.item_type,
      filter: args.filter ? {
        type: "query",
        attributes: args.filter
      } : undefined,
      shared: args.shared
    };

    // Add optional fields if provided
    if (args.columns) payload.columns = args.columns;
    if (args.order_by) payload.order_by = args.order_by;

    // Create the model filter using the typed client
    return await typedClient.createModelFilter(payload);
  }
});