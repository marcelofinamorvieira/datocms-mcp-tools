import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { webhookSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Creates a new webhook in DatoCMS
 * 
 * @param params Parameters for creating a webhook
 * @returns Response with the created webhook details
 */
export const createWebhookHandler = createCreateHandler<any, SimpleSchemaTypes.Webhook>({
  domain: "webhooks.webhooks",
  schemaName: "create",
  schema: webhookSchemas.create,
  entityName: "Webhook",
  successMessage: (result) => `Successfully created webhook '${result.name}' with ID ${result.id}`,
  clientAction: async (client, args) => {
    const { name, url, headers = {}, events } = args;

    // Create the webhook with the official schema
    const createParams: SimpleSchemaTypes.WebhookCreateSchema = {
      name,
      url,
      headers,
      events: events.map((event: string) => ({
        entity_type: event.split(':')[0] as any,
        event_types: [event.split(':')[1]] as any
      })),
      custom_payload: null,
      http_basic_user: null,
      http_basic_password: null
    };

    return await client.webhooks.create(createParams);
  }
});