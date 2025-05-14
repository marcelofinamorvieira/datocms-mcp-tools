import { z } from "zod";

/**
 * Webhook event types
 * Complete list of webhook event types supported by DatoCMS
 * @see https://www.datocms.com/docs/content-management-api/resources/webhook
 */
export const webhookEventTypes = [
  // Record events
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "validate",
  "save", 
  
  // Upload events
  "upload.create",
  "upload.update",
  "upload.delete",
  
  // Deployment events
  "deploy_request",
  "deploy_ongoing",
  "deploy_success",
  "deploy_failure",
  
  // Environment events
  "environment.create",
  "environment.update",
  "environment.delete",
  
  // Item Type events
  "item_type.create",
  "item_type.update",
  "item_type.delete",
  
  // Field events
  "field.create",
  "field.update",
  "field.delete",
  
  // User events
  "user.create",
  "user.update",
  "user.delete",
  
  // Role events
  "role.create",
  "role.update",
  "role.delete",
  
  // Site events
  "site.update"
] as const;

/**
 * Webhook trigger types
 * Types of resources that can trigger a webhook
 */
export const webhookTriggerTypes = [
  "item_type",
  "cache",
  "uploadable_item"
] as const;

/**
 * Webhook payload formats
 * Supported payload formats for webhook delivery
 */
export const webhookPayloadFormats = [
  "json",
  "form"
] as const;

/**
 * Webhook event type schema
 * Zod schema for validating webhook event types
 */
export const webhookEventTypeSchema = z.enum(webhookEventTypes)
  .describe("Event type that will trigger the webhook");

/**
 * Webhook trigger type schema
 * Zod schema for validating webhook trigger types
 */
export const webhookTriggerTypeSchema = z.enum(webhookTriggerTypes)
  .describe("Type of resource that will trigger the webhook");

/**
 * Webhook payload format schema
 * Zod schema for validating webhook payload formats
 */
export const webhookPayloadFormatSchema = z.enum(webhookPayloadFormats)
  .describe("Format of the webhook payload (json or form)");

/**
 * Webhook headers schema
 * Zod schema for validating webhook headers
 */
export const webhookHeadersSchema = z.record(z.string())
  .describe("HTTP headers to be sent with the webhook request");

/**
 * Webhook call status schema
 * Status of a webhook call
 */
export const webhookCallStatusSchema = z.enum([
  "triggered",
  "sending",
  "success",
  "failure"
]).describe("Status of the webhook call");

/**
 * Webhook call filter schema
 * For filtering webhook call logs
 */
export const webhookCallFilterSchema = z.object({
  status: webhookCallStatusSchema.optional()
    .describe("Filter logs by status."),
  itemType: z.string().optional()
    .describe("Filter logs by item type."),
  event: webhookEventTypeSchema.optional()
    .describe("Filter logs by event type.")
}).optional()
  .describe("Filters to apply to the list of webhook call logs.");

export default {
  webhookEventTypeSchema,
  webhookTriggerTypeSchema,
  webhookPayloadFormatSchema,
  webhookHeadersSchema,
  webhookCallStatusSchema,
  webhookCallFilterSchema
};