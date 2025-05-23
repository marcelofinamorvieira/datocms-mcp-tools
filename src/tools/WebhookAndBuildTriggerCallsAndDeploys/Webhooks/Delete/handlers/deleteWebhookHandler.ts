import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { webhookSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

/**
 * Deletes a webhook from DatoCMS
 * 
 * @param params Parameters for deleting a webhook
 * @returns Response indicating success or failure
 */
export const deleteWebhookHandler = createDeleteHandler({
  domain: "webhooks.webhooks",
  schemaName: "delete",
  schema: webhookSchemas.delete,
  entityName: "Webhook",
  idParam: "webhookId",
  clientAction: async (client, args) => {
    await client.webhooks.destroy(args.webhookId);
  }
});