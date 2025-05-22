/**
 * @file webhookAndBuildTriggerClient.ts
 * @description Type-safe client for working with DatoCMS webhooks and build triggers
 * Provides a consistent interface for webhook and build trigger operations
 */

import { UnifiedClientManager } from '../../utils/unifiedClientManager.js';
import type {
  BuildTrigger,
  ApiBuildTrigger,
  CreateBuildTriggerParams,
  UpdateBuildTriggerParams,
  Webhook,
  ApiWebhook,
  CreateWebhookParams,
  UpdateWebhookParams,
  WebhookCall,
  ApiWebhookCall,
  DeployEvent,
  ApiDeployEvent,
  WebhookAndBuildTriggerClient
} from './webhookAndBuildTriggerTypes.js';
import {
  adaptApiBuildTrigger,
  adaptApiWebhook,
  adaptApiWebhookCall,
  adaptApiDeployEvent
} from './webhookAndBuildTriggerTypes.js';

/**
 * Implementation of the WebhookAndBuildTriggerClient interface
 */
export class TypedWebhookAndBuildTriggerClient implements WebhookAndBuildTriggerClient {
  private client: any;

  /**
   * Creates a new webhook and build trigger client
   * 
   * @param apiToken - DatoCMS API token
   * @param environment - Optional environment to target
   */
  constructor(apiToken: string, environment?: string) {
    this.client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  }

  /**
   * Create a build trigger
   * 
   * @param data - Build trigger creation parameters
   * @returns The created build trigger
   */
  async createBuildTrigger(data: CreateBuildTriggerParams): Promise<BuildTrigger> {
    const apiBuildTrigger = await this.client.buildTriggers.create(data) as ApiBuildTrigger;
    return adaptApiBuildTrigger(apiBuildTrigger);
  }

  /**
   * Get a build trigger by ID
   * 
   * @param id - Build trigger ID
   * @returns The build trigger
   */
  async getBuildTrigger(id: string): Promise<BuildTrigger> {
    const apiBuildTrigger = await this.client.buildTriggers.find(id) as ApiBuildTrigger;
    return adaptApiBuildTrigger(apiBuildTrigger);
  }

  /**
   * List all build triggers
   * 
   * @returns Array of build triggers
   */
  async listBuildTriggers(): Promise<BuildTrigger[]> {
    const apiBuildTriggers = await this.client.buildTriggers.list() as ApiBuildTrigger[];
    return apiBuildTriggers.map(trigger => adaptApiBuildTrigger(trigger));
  }

  /**
   * Update a build trigger
   * 
   * @param id - Build trigger ID
   * @param data - Update parameters
   * @returns The updated build trigger
   */
  async updateBuildTrigger(id: string, data: UpdateBuildTriggerParams): Promise<BuildTrigger> {
    const apiBuildTrigger = await this.client.buildTriggers.update(id, data) as ApiBuildTrigger;
    return adaptApiBuildTrigger(apiBuildTrigger);
  }

  /**
   * Delete a build trigger
   * 
   * @param id - Build trigger ID
   * @returns Promise that resolves when the build trigger is deleted
   */
  async deleteBuildTrigger(id: string): Promise<void> {
    await this.client.buildTriggers.destroy(id);
  }

  /**
   * Trigger a build
   * 
   * @param id - Build trigger ID
   * @returns The created deploy event
   */
  async triggerBuild(id: string): Promise<DeployEvent> {
    const apiDeployEvent = await this.client.buildTriggers.trigger(id) as ApiDeployEvent;
    return adaptApiDeployEvent(apiDeployEvent);
  }

  /**
   * Create a webhook
   * 
   * @param data - Webhook creation parameters
   * @returns The created webhook
   */
  async createWebhook(data: CreateWebhookParams): Promise<Webhook> {
    const apiWebhook = await this.client.webhooks.create(data) as ApiWebhook;
    return adaptApiWebhook(apiWebhook);
  }

  /**
   * Get a webhook by ID
   * 
   * @param id - Webhook ID
   * @returns The webhook
   */
  async getWebhook(id: string): Promise<Webhook> {
    const apiWebhook = await this.client.webhooks.find(id) as ApiWebhook;
    return adaptApiWebhook(apiWebhook);
  }

  /**
   * List all webhooks
   * 
   * @returns Array of webhooks
   */
  async listWebhooks(): Promise<Webhook[]> {
    const apiWebhooks = await this.client.webhooks.list() as ApiWebhook[];
    return apiWebhooks.map(webhook => adaptApiWebhook(webhook));
  }

  /**
   * Update a webhook
   * 
   * @param id - Webhook ID
   * @param data - Update parameters
   * @returns The updated webhook
   */
  async updateWebhook(id: string, data: UpdateWebhookParams): Promise<Webhook> {
    const apiWebhook = await this.client.webhooks.update(id, data) as ApiWebhook;
    return adaptApiWebhook(apiWebhook);
  }

  /**
   * Delete a webhook
   * 
   * @param id - Webhook ID
   * @returns Promise that resolves when the webhook is deleted
   */
  async deleteWebhook(id: string): Promise<void> {
    await this.client.webhooks.destroy(id);
  }

  /**
   * Get a webhook call by ID
   * 
   * @param id - Webhook call ID
   * @returns The webhook call
   */
  async getWebhookCall(id: string): Promise<WebhookCall> {
    const apiWebhookCall = await this.client.webhookCalls.find(id) as ApiWebhookCall;
    return adaptApiWebhookCall(apiWebhookCall);
  }

  /**
   * List webhook calls with optional filtering
   * 
   * @param params - Optional parameters for filtering webhook calls
   * @returns Array of webhook calls
   */
  async listWebhookCalls(params?: { webhook_id?: string }): Promise<WebhookCall[]> {
    const apiWebhookCalls = await this.client.webhookCalls.list(params) as ApiWebhookCall[];
    return apiWebhookCalls.map(call => adaptApiWebhookCall(call));
  }

  /**
   * Resend a webhook call
   * 
   * @param id - Webhook call ID
   * @returns The resent webhook call
   */
  async resendWebhookCall(id: string): Promise<WebhookCall> {
    const apiWebhookCall = await this.client.webhookCalls.resend(id) as ApiWebhookCall;
    return adaptApiWebhookCall(apiWebhookCall);
  }

  /**
   * Get a deploy event by ID
   * 
   * @param id - Deploy event ID
   * @returns The deploy event
   */
  async getDeployEvent(id: string): Promise<DeployEvent> {
    const apiDeployEvent = await this.client.deployEvents.find(id) as ApiDeployEvent;
    return adaptApiDeployEvent(apiDeployEvent);
  }

  /**
   * List deploy events with optional filtering
   * 
   * @param params - Optional parameters for filtering deploy events
   * @returns Array of deploy events
   */
  async listDeployEvents(params?: { build_trigger_id?: string }): Promise<DeployEvent[]> {
    const apiDeployEvents = await this.client.deployEvents.list(params) as ApiDeployEvent[];
    return apiDeployEvents.map(event => adaptApiDeployEvent(event));
  }
}

/**
 * Creates a type-safe webhook and build trigger client
 * 
 * @param apiToken - DatoCMS API token
 * @param environment - Optional environment to target
 * @returns Webhook and build trigger client instance
 */
export function createWebhookAndBuildTriggerClient(apiToken: string, environment?: string): WebhookAndBuildTriggerClient {
  return new TypedWebhookAndBuildTriggerClient(apiToken, environment);
}