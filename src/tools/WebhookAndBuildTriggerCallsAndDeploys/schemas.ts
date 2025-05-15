import { z } from "zod";
import {
  apiTokenSchema,
  environmentSchema,
  createBaseSchema,
  createRetrieveSchema,
  createListSchema,
  paginationSchema
} from "../../utils/sharedSchemas.js";

import {
  webhookEventTypeSchema,
  webhookTriggerTypeSchema,
  webhookPayloadFormatSchema,
  webhookHeadersSchema,
  webhookCallStatusSchema,
  webhookCallFilterSchema
} from "./webhookTypes.js";

import {
  adapterTypeSchema,
  adapterSettingsSchema,
  genericAdapterSettingsSchema
} from "./buildTriggerTypes.js";

/**
 * Schemas for all webhook-related actions.
 * These schemas define the parameters expected by the webhook tools
 * and are used for validation and documentation.
 *
 * @see https://www.datocms.com/docs/content-management-api/resources/webhook
 */
export const webhookSchemas = {
  list: createListSchema(),

  retrieve: createRetrieveSchema("webhook"),

  create: createBaseSchema().extend({
    name: z.string().min(1).describe("A name for the webhook."),
    url: z.string().url().describe("The URL that will be called when the webhook is triggered."),
    headers: webhookHeadersSchema.optional(),
    events: z.array(webhookEventTypeSchema).min(1)
      .describe("Array of events that will trigger the webhook."),
    payload_format: webhookPayloadFormatSchema.optional().default("json"),
    triggers: z.array(webhookTriggerTypeSchema).optional()
      .describe("Types of resources that will trigger the webhook."),
    httpsOnly: z.boolean().optional().default(true)
      .describe("If true, only HTTPS URLs will be accepted.")
  }),

  update: createBaseSchema().extend({
    webhookId: z.string().min(1).describe("The ID of the webhook to update."),
    name: z.string().min(1).optional().describe("A new name for the webhook."),
    url: z.string().url().optional()
      .describe("The new URL that will be called when the webhook is triggered."),
    headers: webhookHeadersSchema.optional()
      .describe("New HTTP headers to be sent with the webhook request."),
    events: z.array(webhookEventTypeSchema).min(1).optional()
      .describe("New array of events that will trigger the webhook."),
    payload_format: webhookPayloadFormatSchema.optional()
      .describe("The new format of the payload: 'json' or 'form'."),
    triggers: z.array(webhookTriggerTypeSchema).optional()
      .describe("New types of resources that will trigger the webhook."),
    httpsOnly: z.boolean().optional()
      .describe("If true, only HTTPS URLs will be accepted.")
  }),

  delete: createBaseSchema().extend({
    webhookId: z.string().min(1).describe("The ID of the webhook to delete.")
  })
};

/**
 * Schemas for all webhook call log-related actions.
 * These schemas define the parameters expected by the webhook call log tools
 * and are used for validation and documentation.
 * 
 * @see https://www.datocms.com/docs/content-management-api/resources/webhook-call
 */
export const webhookCallSchemas = {
  list: createBaseSchema().extend({
    webhookId: z.string().min(1).describe("The ID of the webhook to retrieve call logs for."),
    filter: webhookCallFilterSchema,
    page: paginationSchema.optional()
  }),

  retrieve: createBaseSchema().extend({
    webhookId: z.string().min(1).describe("The ID of the webhook that the call belongs to."),
    callId: z.string().min(1).describe("The ID of the webhook call to retrieve.")
  }),

  resend: createBaseSchema().extend({
    webhookId: z.string().min(1).describe("The ID of the webhook that the call belongs to."),
    callId: z.string().min(1).describe("The ID of the webhook call to resend.")
  })
};

/**
 * Schemas for all build trigger-related actions.
 * These schemas define the parameters expected by the build trigger tools
 * and are used for validation and documentation.
 * 
 * @see https://www.datocms.com/docs/content-management-api/resources/build-trigger
 */
export const buildTriggerSchemas = {
  list: createListSchema(),

  retrieve: createRetrieveSchema("buildTrigger"),

  create: createBaseSchema().extend({
    name: z.string().min(1).describe("A name for the build trigger."),
    adapter: adapterTypeSchema,
    // Support two approaches: simplified record and strongly-typed discriminated union
    adapter_settings: z.union([
      genericAdapterSettingsSchema,
      adapterSettingsSchema
    ]),
    indexing_enabled: z.boolean().optional().default(false)
      .describe("Whether to enable site search indexing.")
  }),

  update: createBaseSchema().extend({
    buildTriggerId: z.string().min(1).describe("The ID of the build trigger to update."),
    name: z.string().min(1).optional().describe("A new name for the build trigger."),
    adapter: adapterTypeSchema.optional(),
    adapter_settings: z.union([
      genericAdapterSettingsSchema,
      adapterSettingsSchema
    ]).optional(),
    indexing_enabled: z.boolean().optional()
      .describe("Whether to enable site search indexing.")
  }),

  delete: createBaseSchema().extend({
    buildTriggerId: z.string().min(1).describe("The ID of the build trigger to delete.")
  }),

  trigger: createBaseSchema().extend({
    buildTriggerId: z.string().min(1).describe("The ID of the build trigger to execute.")
  }),

  abort: createBaseSchema().extend({
    buildTriggerId: z.string().min(1).describe("The ID of the build trigger to abort.")
  }),

  abortIndexing: createBaseSchema().extend({
    buildTriggerId: z.string().min(1).describe("The ID of the build trigger to abort site search indexing.")
  }),

  reindex: createBaseSchema().extend({
    buildTriggerId: z.string().min(1).describe("The ID of the build trigger to reindex site search.")
  })
};

/**
 * Schemas for all deploy event-related actions.
 * These schemas define the parameters expected by the deploy event tools
 * and are used for validation and documentation.
 *
 * @see https://www.datocms.com/docs/content-management-api/resources/build-event
 */
export const deployEventSchemas = {
  list: createBaseSchema().extend({
    buildTriggerId: z.string().min(1).describe("The ID of the build trigger to retrieve deploy events for."),
    filter: z.object({
      eventType: z.string().optional().describe("Filter events by event type.")
    }).optional(),
    page: paginationSchema.optional()
  }),

  retrieve: createBaseSchema().extend({
    buildTriggerId: z.string().min(1).describe("The ID of the build trigger that the event belongs to."),
    eventId: z.string().min(1).describe("The ID of the deploy event to retrieve.")
  })
};

// Create arrays of all available actions for the enums
export const webhookActionsList = Object.keys(webhookSchemas) as Array<keyof typeof webhookSchemas>;
export const webhookCallActionsList = Object.keys(webhookCallSchemas) as Array<keyof typeof webhookCallSchemas>;
export const buildTriggerActionsList = Object.keys(buildTriggerSchemas) as Array<keyof typeof buildTriggerSchemas>;
export const deployEventActionsList = Object.keys(deployEventSchemas) as Array<keyof typeof deployEventSchemas>;