/**
 * @file webhookAndBuildTriggerTypes.ts
 * @description Type definitions for DatoCMS webhook and build trigger operations
 * Imports types from the DatoCMS CMA client and defines additional types for the MCP server
 */

import type { Response } from '../../utils/responseHandlers.js';
import type { DatoCMSApiError } from '../../utils/errorHandlers.js';

/**
 * Build trigger types
 */
export type BuildTriggerAdapterType = 'netlify' | 'vercel' | 'gatsby_cloud' | 'custom';

/**
 * Core properties of a DatoCMS build trigger
 */
export interface BuildTrigger {
  id: string;
  type: 'build_trigger';
  name: string;
  adapter: BuildTriggerAdapterType;
  adapter_settings: Record<string, unknown>;
  indexing_enabled: boolean;
  frontend_url?: string;
  webhook_token?: string;
  meta: BuildTriggerMeta;
}

/**
 * Metadata about a build trigger
 */
export interface BuildTriggerMeta {
  /**
   * Build trigger creation date
   */
  created_at: string;
  
  /**
   * Date of last update
   */
  updated_at: string;
}

/**
 * Represents a build trigger as returned directly from the API
 * This matches the actual structure from the DatoCMS API
 */
export interface ApiBuildTrigger {
  id: string;
  type: string;
  name: string;
  adapter: string;
  adapter_settings: Record<string, unknown>;
  indexing_enabled: boolean;
  frontend_url?: string;
  webhook_token?: string;
  meta?: {
    created_at?: string;
    updated_at?: string;
  };
}

/**
 * Converts an API build trigger to our internal BuildTrigger type
 */
export function adaptApiBuildTrigger(apiTrigger: ApiBuildTrigger): BuildTrigger {
  return {
    id: apiTrigger.id,
    type: 'build_trigger',
    name: apiTrigger.name,
    adapter: apiTrigger.adapter as BuildTriggerAdapterType,
    adapter_settings: apiTrigger.adapter_settings,
    indexing_enabled: apiTrigger.indexing_enabled,
    frontend_url: apiTrigger.frontend_url,
    webhook_token: apiTrigger.webhook_token,
    meta: {
      created_at: apiTrigger.meta?.created_at || new Date().toISOString(),
      updated_at: apiTrigger.meta?.updated_at || new Date().toISOString()
    }
  };
}

/**
 * Parameters for creating a build trigger
 */
export interface CreateBuildTriggerParams {
  /**
   * Name of the build trigger
   */
  name: string;
  
  /**
   * Type of adapter to use
   */
  adapter: BuildTriggerAdapterType;
  
  /**
   * Settings specific to the adapter
   */
  adapter_settings: Record<string, unknown>;
  
  /**
   * Whether indexing is enabled for this trigger
   */
  indexing_enabled?: boolean;
}

/**
 * Parameters for updating a build trigger
 */
export interface UpdateBuildTriggerParams {
  /**
   * New name for the build trigger
   */
  name?: string;
  
  /**
   * New adapter settings
   */
  adapter_settings?: Record<string, unknown>;
  
  /**
   * New indexing status
   */
  indexing_enabled?: boolean;
}

/**
 * Core properties of a DatoCMS webhook
 */
export interface Webhook {
  id: string;
  type: 'webhook';
  name: string;
  url: string;
  headers: Record<string, string>;
  events: string[];
  enabled: boolean;
  meta: WebhookMeta;
}

/**
 * Metadata about a webhook
 */
export interface WebhookMeta {
  /**
   * Webhook creation date
   */
  created_at: string;
  
  /**
   * Date of last update
   */
  updated_at: string;
}

/**
 * Represents a webhook as returned directly from the API
 */
export interface ApiWebhook {
  id: string;
  type: string;
  name: string;
  url: string;
  headers: Record<string, string>;
  events: string[];
  enabled: boolean;
  meta?: {
    created_at?: string;
    updated_at?: string;
  };
}

/**
 * Converts an API webhook to our internal Webhook type
 */
export function adaptApiWebhook(apiWebhook: ApiWebhook): Webhook {
  return {
    id: apiWebhook.id,
    type: 'webhook',
    name: apiWebhook.name,
    url: apiWebhook.url,
    headers: apiWebhook.headers,
    events: apiWebhook.events,
    enabled: apiWebhook.enabled,
    meta: {
      created_at: apiWebhook.meta?.created_at || new Date().toISOString(),
      updated_at: apiWebhook.meta?.updated_at || new Date().toISOString()
    }
  };
}

/**
 * Parameters for creating a webhook
 */
export interface CreateWebhookParams {
  /**
   * Name of the webhook
   */
  name: string;
  
  /**
   * URL to send webhook calls to
   */
  url: string;
  
  /**
   * HTTP headers to include with webhook calls
   */
  headers?: Record<string, string>;
  
  /**
   * Event types to trigger this webhook
   */
  events: string[];
  
  /**
   * Whether the webhook is enabled
   */
  enabled?: boolean;
}

/**
 * Parameters for updating a webhook
 */
export interface UpdateWebhookParams {
  /**
   * New name for the webhook
   */
  name?: string;
  
  /**
   * New URL for the webhook
   */
  url?: string;
  
  /**
   * New HTTP headers for the webhook
   */
  headers?: Record<string, string>;
  
  /**
   * New event types for the webhook
   */
  events?: string[];
  
  /**
   * New enabled status for the webhook
   */
  enabled?: boolean;
}

/**
 * Core properties of a webhook call
 */
export interface WebhookCall {
  id: string;
  type: 'webhook_call';
  webhook: {
    id: string;
    type: 'webhook';
  };
  status_code: number | null;
  request_body: Record<string, unknown>;
  response_body: string | null;
  response_headers: Record<string, string> | null;
  error: string | null;
  event_type: string;
  meta: WebhookCallMeta;
}

/**
 * Metadata about a webhook call
 */
export interface WebhookCallMeta {
  /**
   * Webhook call creation date
   */
  created_at: string;
  
  /**
   * Webhook call completion date
   */
  completed_at: string | null;
  
  /**
   * Date when the webhook call was retried
   */
  retried_at: string | null;
}

/**
 * Represents a webhook call as returned directly from the API
 */
export interface ApiWebhookCall {
  id: string;
  type: string;
  webhook: {
    id: string;
    type: string;
  };
  status_code: number | null;
  request_body: Record<string, unknown>;
  response_body: string | null;
  response_headers: Record<string, string> | null;
  error: string | null;
  event_type: string;
  meta?: {
    created_at?: string;
    completed_at?: string | null;
    retried_at?: string | null;
  };
}

/**
 * Converts an API webhook call to our internal WebhookCall type
 */
export function adaptApiWebhookCall(apiCall: ApiWebhookCall): WebhookCall {
  return {
    id: apiCall.id,
    type: 'webhook_call',
    webhook: {
      id: apiCall.webhook.id,
      type: 'webhook'
    },
    status_code: apiCall.status_code,
    request_body: apiCall.request_body,
    response_body: apiCall.response_body,
    response_headers: apiCall.response_headers,
    error: apiCall.error,
    event_type: apiCall.event_type,
    meta: {
      created_at: apiCall.meta?.created_at || new Date().toISOString(),
      completed_at: apiCall.meta?.completed_at || null,
      retried_at: apiCall.meta?.retried_at || null
    }
  };
}

/**
 * Core properties of a DatoCMS deploy event
 */
export interface DeployEvent {
  id: string;
  type: 'deploy_event';
  build_trigger: {
    id: string;
    type: 'build_trigger';
  };
  environment: {
    id: string;
    type: 'environment';
  };
  entity_token: string;
  frontend_url: string | null;
  deploy_status: 'success' | 'error' | 'building' | 'pending';
  environment_name: string;
  meta: DeployEventMeta;
}

/**
 * Metadata about a deploy event
 */
export interface DeployEventMeta {
  /**
   * Deploy event creation date
   */
  created_at: string;
  
  /**
   * Date of last update
   */
  updated_at: string;
}

/**
 * Represents a deploy event as returned directly from the API
 */
export interface ApiDeployEvent {
  id: string;
  type: string;
  build_trigger: {
    id: string;
    type: string;
  };
  environment: {
    id: string;
    type: string;
  };
  entity_token: string;
  frontend_url: string | null;
  deploy_status: string;
  environment_name: string;
  meta?: {
    created_at?: string;
    updated_at?: string;
  };
}

/**
 * Converts an API deploy event to our internal DeployEvent type
 */
export function adaptApiDeployEvent(apiEvent: ApiDeployEvent): DeployEvent {
  return {
    id: apiEvent.id,
    type: 'deploy_event',
    build_trigger: {
      id: apiEvent.build_trigger.id,
      type: 'build_trigger'
    },
    environment: {
      id: apiEvent.environment.id,
      type: 'environment'
    },
    entity_token: apiEvent.entity_token,
    frontend_url: apiEvent.frontend_url,
    deploy_status: apiEvent.deploy_status as 'success' | 'error' | 'building' | 'pending',
    environment_name: apiEvent.environment_name,
    meta: {
      created_at: apiEvent.meta?.created_at || new Date().toISOString(),
      updated_at: apiEvent.meta?.updated_at || new Date().toISOString()
    }
  };
}

/**
 * Success response for webhook and build trigger operations
 */
export type WebhookAndBuildTriggerResponse = Response;

/**
 * Error specific to webhook and build trigger operations
 */
export interface WebhookAndBuildTriggerError extends DatoCMSApiError {
  /**
   * Specific error codes for webhook and build trigger operations
   */
  code?: 'BUILD_TRIGGER_NOT_FOUND' | 'WEBHOOK_NOT_FOUND' | 'WEBHOOK_CALL_NOT_FOUND' | 'DEPLOY_EVENT_NOT_FOUND' | 'VALIDATION_ERROR' | 'UNAUTHORIZED';
}

/**
 * Type guard to check if an error is a webhook or build trigger specific error
 */
export function isWebhookOrBuildTriggerError(error: unknown): error is WebhookAndBuildTriggerError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as WebhookAndBuildTriggerError).code === 'string' &&
    [
      'BUILD_TRIGGER_NOT_FOUND',
      'WEBHOOK_NOT_FOUND',
      'WEBHOOK_CALL_NOT_FOUND',
      'DEPLOY_EVENT_NOT_FOUND',
      'VALIDATION_ERROR',
      'UNAUTHORIZED'
    ].includes((error as WebhookAndBuildTriggerError).code as string)
  );
}

/**
 * MCP response type
 */
export type McpResponse = Response;

/**
 * Client interface for webhook and build trigger operations
 */
export interface WebhookAndBuildTriggerClient {
  /**
   * Create a build trigger
   */
  createBuildTrigger: (data: CreateBuildTriggerParams) => Promise<BuildTrigger>;
  
  /**
   * Get a build trigger by ID
   */
  getBuildTrigger: (id: string) => Promise<BuildTrigger>;
  
  /**
   * List all build triggers
   */
  listBuildTriggers: () => Promise<BuildTrigger[]>;
  
  /**
   * Update a build trigger
   */
  updateBuildTrigger: (id: string, data: UpdateBuildTriggerParams) => Promise<BuildTrigger>;
  
  /**
   * Delete a build trigger
   */
  deleteBuildTrigger: (id: string) => Promise<void>;
  
  /**
   * Trigger a build
   */
  triggerBuild: (id: string) => Promise<DeployEvent>;
  
  /**
   * Create a webhook
   */
  createWebhook: (data: CreateWebhookParams) => Promise<Webhook>;
  
  /**
   * Get a webhook by ID
   */
  getWebhook: (id: string) => Promise<Webhook>;
  
  /**
   * List all webhooks
   */
  listWebhooks: () => Promise<Webhook[]>;
  
  /**
   * Update a webhook
   */
  updateWebhook: (id: string, data: UpdateWebhookParams) => Promise<Webhook>;
  
  /**
   * Delete a webhook
   */
  deleteWebhook: (id: string) => Promise<void>;
  
  /**
   * Get a webhook call by ID
   */
  getWebhookCall: (id: string) => Promise<WebhookCall>;
  
  /**
   * List webhook calls
   */
  listWebhookCalls: (params?: { webhook_id?: string }) => Promise<WebhookCall[]>;
  
  /**
   * Resend a webhook call
   */
  resendWebhookCall: (id: string) => Promise<WebhookCall>;
  
  /**
   * Get a deploy event by ID
   */
  getDeployEvent: (id: string) => Promise<DeployEvent>;
  
  /**
   * List deploy events
   */
  listDeployEvents: (params?: { build_trigger_id?: string }) => Promise<DeployEvent[]>;
}