import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { webhookCallSchemas } from "../../../schemas.js";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";

/**
 * Resends a specific webhook call
 * 
 * @param params Parameters for resending a webhook call
 * @returns Response indicating success or failure of the resend operation
 */
export const resendWebhookCallHandler = createCustomHandler({
  domain: "webhooks.webhookCalls",
  schemaName: "resend",
  schema: webhookCallSchemas.resend,
  entityName: "Webhook Call",
  operation: "resend",
  clientAction: async (client, args) => {
    // Resend the webhook call with proper typing
    const webhookCall = await client.webhookCalls.resend(args.callId);

    // Return success response
    return {
      success: true,
      message: `Webhook call with ID ${args.callId} has been successfully resent.`,
      webhook_call: webhookCall
    };
  }
});