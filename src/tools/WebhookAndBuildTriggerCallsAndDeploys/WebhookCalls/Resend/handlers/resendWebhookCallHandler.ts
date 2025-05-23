import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType, UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { webhookCallSchemas } from "../../../schemas.js";

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
  errorContext: {
    operation: "resend"
  }
}, async (args: any) => {
  const { apiToken, environment, callId } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Resend the webhook call
  await (client as any).webhookCalls.resend(callId);

  // Return success response
  const result = {
    success: true,
    message: `Webhook call with ID ${callId} has been successfully resent.`
  };
  
  return createResponse(JSON.stringify(result, null, 2));
});