import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { webhookSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Updates an existing webhook in DatoCMS
 * 
 * @param params Parameters for updating a webhook
 * @returns Response with the updated webhook details
 */
export const updateWebhookHandler = createUpdateHandler<any, SimpleSchemaTypes.Webhook>({
  domain: "webhooks.webhooks",
  schemaName: "update",
  schema: webhookSchemas.update,
  entityName: "Webhook",
  idParam: "webhookId",
  clientAction: async (client, args) => {
    const { webhookId, name, url, headers, events } = args;

    // Build update payload with only the provided parameters
    const updatePayload: SimpleSchemaTypes.WebhookUpdateSchema = {};
    
    if (name !== undefined) updatePayload.name = name;
    if (url !== undefined) updatePayload.url = url;
    if (headers !== undefined) updatePayload.headers = headers;
    if (events !== undefined) {
      updatePayload.events = events.map((event: string) => ({
        entity_type: event.split(':')[0] as any,
        event_types: [event.split(':')[1]] as any
      }));
    }

    return await client.webhooks.update(webhookId, updatePayload);
  }
});