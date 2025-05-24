import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { buildTriggerSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Creates a new build trigger in DatoCMS
 * 
 * @param params Parameters for creating a build trigger
 * @returns Response with the created build trigger details
 */
export const createBuildTriggerHandler = createCreateHandler<any, SimpleSchemaTypes.BuildTrigger>({
  domain: "webhooks.buildTriggers",
  schemaName: "create",
  schema: buildTriggerSchemas.create,
  entityName: "Build Trigger",
  successMessage: (result) => `Successfully created build trigger '${result.name}' with ID '${result.id}'`,
  clientAction: async (client, args) => {
    const { name, adapter, adapter_settings, indexing_enabled } = args;
    
    // Create the build trigger with the official schema
    const createParams: SimpleSchemaTypes.BuildTriggerCreateSchema = {
      name,
      adapter: adapter as any,
      adapter_settings,
      indexing_enabled: indexing_enabled ?? false,
      frontend_url: null,
      autotrigger_on_scheduled_publications: false
    };

    return await client.buildTriggers.create(createParams);
  }
});