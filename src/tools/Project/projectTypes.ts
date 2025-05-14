/**
 * Project Module Type Definitions
 * 
 * This file contains type definitions for the Project module, including
 * Site and related entities. These types are aligned with the DatoCMS API
 * but adapted to our specific needs.
 */

// Base API types from DatoCMS SimpleSchemaTypes
export type SiteIdentity = string;
export type SiteType = 'site';

// Metadata for project entities
export interface SiteMeta {
  created_at: string;
  updated_at: string;
}

/**
 * Site represents a DatoCMS project
 */
export interface Site {
  id: SiteIdentity;
  type: SiteType;
  name: string;
  domain: string | null;
  google_maps_api_token: string | null;
  imgix_host: string | null;
  internal_domain: string | null;
  locales: [string, ...string[]];
  timezone: string;
  no_index: boolean;
  favicon: string | null;
  last_data_change_at: string | null;
  require_2fa: boolean;
  ip_tracking_enabled: boolean;
  assets_cdn_host?: string | null;
  assets_cdn_public_key?: string | null;
  improved_timezone_management?: boolean;
  improved_hex_management?: boolean;
  improved_gql_multilocale_fields?: boolean;
  improved_gql_visibility_control?: boolean;
  improved_boolean_fields?: boolean;
  draft_mode_active_as_default?: boolean;
  improved_validation_at_publishing?: boolean;
  assets_cdn_default_settings?: AssetsCdnDefaultSettings;
  meta: SiteMeta;
}

/**
 * Settings for assets CDN
 */
export interface AssetsCdnDefaultSettings {
  auto_blurhash?: boolean;
  auto_format?: boolean;
  auto_webp?: boolean;
  auto_avif?: boolean;
  auto_jxr?: boolean;
  crop_mode?: string;
  expires_version?: number;
  fit_mode?: string;
  format_original?: boolean;
  immediate_url?: boolean;
  no_double_url_encode?: boolean;
  progressive_jpeg?: boolean;
  size_adjustment_strategy?: string;
  strip_metadata?: boolean;
  webp_lossy_quality?: number;
  avif_lossy_quality?: number;
  webp_near_lossless_quality?: number;
  jxr_lossy_quality?: number;
  jpeg_quality?: number;
  png_compression_level?: number;
  auto_compress?: boolean;
  auto_compress_lossy_threshold?: number;
  upscale?: boolean;
  gif_quality?: number;
  auto_rotate?: boolean;
  jxr_lossless?: boolean;
  auto_gif_to_video?: boolean;
  auto_watermark?: boolean;
  webp_lossless?: boolean;
  avif_lossless?: boolean;
}

/**
 * Parameters for updating site settings
 */
export interface SiteUpdateParams {
  name?: string;
  locales?: string[];
  timezone?: string;
  no_index?: boolean;
  domain?: string | null;
  favicon?: string | null;
  google_maps_api_token?: string | null;
  assets_cdn_host?: string | null;
  assets_cdn_public_key?: string | null;
  require_2fa?: boolean;
  ip_tracking_enabled?: boolean;
}

// Error types
export interface DatoCMSApiError {
  code: string;
  status: number;
  message: string;
}

export interface DatoCMSValidationError extends DatoCMSApiError {
  code: 'VALIDATION_ERROR';
  status: 422;
  errors?: Array<{
    field?: string;
    message: string;
    details?: unknown;
  }>;
}

export interface DatoCMSNotFoundError extends DatoCMSApiError {
  code: 'ENTITY_NOT_FOUND';
  status: 404;
}

export interface DatoCMSAuthorizationError extends DatoCMSApiError {
  code: 'UNAUTHORIZED';
  status: 401;
}

// Type guards for error handling
export function isDatoCMSValidationError(error: unknown): error is DatoCMSValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'VALIDATION_ERROR' &&
    'status' in error &&
    error.status === 422
  );
}

export function isDatoCMSNotFoundError(error: unknown): error is DatoCMSNotFoundError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENTITY_NOT_FOUND' &&
    'status' in error &&
    error.status === 404
  );
}

export function isDatoCMSAuthorizationError(error: unknown): error is DatoCMSAuthorizationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'UNAUTHORIZED' &&
    'status' in error &&
    error.status === 401
  );
}

// Type adapter functions to convert between API and internal types
export function adaptApiSite(apiSite: any): Site {
  return {
    id: apiSite.id,
    type: apiSite.type,
    name: apiSite.name,
    domain: apiSite.domain,
    google_maps_api_token: apiSite.google_maps_api_token,
    imgix_host: apiSite.imgix_host,
    internal_domain: apiSite.internal_domain,
    locales: apiSite.locales,
    timezone: apiSite.timezone,
    no_index: apiSite.no_index,
    favicon: apiSite.favicon,
    last_data_change_at: apiSite.last_data_change_at,
    require_2fa: apiSite.require_2fa,
    ip_tracking_enabled: apiSite.ip_tracking_enabled,
    assets_cdn_host: apiSite.assets_cdn_host,
    assets_cdn_public_key: apiSite.assets_cdn_public_key,
    improved_timezone_management: apiSite.improved_timezone_management,
    improved_hex_management: apiSite.improved_hex_management,
    improved_gql_multilocale_fields: apiSite.improved_gql_multilocale_fields,
    improved_gql_visibility_control: apiSite.improved_gql_visibility_control,
    improved_boolean_fields: apiSite.improved_boolean_fields,
    draft_mode_active_as_default: apiSite.draft_mode_active_as_default,
    improved_validation_at_publishing: apiSite.improved_validation_at_publishing,
    assets_cdn_default_settings: apiSite.assets_cdn_default_settings,
    meta: {
      created_at: apiSite.meta?.created_at || new Date().toISOString(),
      updated_at: apiSite.meta?.updated_at || new Date().toISOString()
    }
  };
}