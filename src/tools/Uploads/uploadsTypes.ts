/**
 * @file uploadsTypes.ts
 * @description Type definitions for the Uploads module entities
 */

// Common types
export type UploadIdentity = string;
export type UploadType = 'upload';
export type UploadCollectionIdentity = string;
export type UploadCollectionType = 'upload_collection';
export type UploadTagIdentity = string;
export type UploadTagType = 'tag';
export type UploadSmartTagIdentity = string;
export type UploadSmartTagType = 'smart_tag';

// Base interface for meta information
export interface UploadMeta {
  created_at: string;
  updated_at: string;
  is_image?: boolean;
  is_audio?: boolean;
  is_video?: boolean;
  width?: number;
  height?: number;
  duration?: number;
  size: number;
}

// Upload formats
export interface UploadFormat {
  width?: number;
  height?: number;
  format: string;
  size: number;
  url: string;
}

export interface UploadColorInfo {
  red: number;
  green: number;
  blue: number;
  alpha?: number;
}

export interface UploadColorAnalysis {
  dominant_colors?: {
    rgb: UploadColorInfo;
    hex: string;
    percent: number;
  }[];
  palette_vibrant?: UploadColorInfo;
  palette_muted?: UploadColorInfo;
  palette_light_vibrant?: UploadColorInfo;
  palette_dark_vibrant?: UploadColorInfo;
  palette_light_muted?: UploadColorInfo;
  palette_dark_muted?: UploadColorInfo;
}

export interface UploadBlurhash {
  data: string;
  punch?: number;
}

export interface UploadSmartTags {
  [key: string]: number;
}

export interface UploadFieldMetadata {
  title?: string;
  alt?: string;
  focal_point?: {
    x: number;
    y: number;
  };
  custom_data?: Record<string, any>;
}

/**
 * Upload represents a DatoCMS media asset
 */
export interface Upload {
  id: UploadIdentity;
  type: UploadType;
  attributes: {
    path: string;
    basename: string;
    size: number;
    width?: number;
    height?: number;
    format: string;
    author?: string | null;
    copyright?: string | null;
    notes?: string | null;
    smart_tags?: UploadSmartTags;
    focal_point?: {
      x: number;
      y: number;
    } | null;
    blurhash?: UploadBlurhash | null;
    colors?: UploadColorAnalysis;
    exif_info?: Record<string, any>;
    mime_type: string;
    duration?: number | null;
    tags: string[];
    url: string;
    is_image: boolean;
    is_audio: boolean;
    is_video: boolean;
    default_field_metadata: Record<string, UploadFieldMetadata>;
    responsive_image_meta?: {
      [key: string]: UploadFormat;
    };
  };
  relationships: {
    upload_collection?: {
      data: {
        id: UploadCollectionIdentity;
        type: UploadCollectionType;
      } | null;
    };
  };
  meta: UploadMeta;
}

/**
 * UploadCollection represents a folder for organizing uploads
 */
export interface UploadCollection {
  id: UploadCollectionIdentity;
  type: UploadCollectionType;
  attributes: {
    label: string;
    position: number;
  };
  relationships: {
    parent?: {
      data: {
        id: UploadCollectionIdentity;
        type: UploadCollectionType;
      } | null;
    };
    children?: {
      data: {
        id: UploadCollectionIdentity;
        type: UploadCollectionType;
      }[];
    };
  };
  meta: {
    created_at: string;
    updated_at: string;
  };
}

/**
 * UploadTag represents a DatoCMS manual upload tag
 */
export interface UploadTag {
  id: UploadTagIdentity;
  type: UploadTagType;
  attributes: {
    name: string;
  };
  meta: {
    created_at: string;
    updated_at: string;
  };
}

/**
 * UploadSmartTag represents an automatically detected tag
 */
export interface UploadSmartTag {
  id: UploadSmartTagIdentity;
  type: UploadSmartTagType;
  attributes: {
    name: string;
  };
  meta: {
    created_at: string;
    updated_at: string;
  };
}

// Reference entities (used in upload references)
export interface UploadReference {
  id: string;
  type: string;
  attributes: Record<string, any>;
  relationships: Record<string, any>;
  meta: {
    created_at: string;
    updated_at: string;
  };
}

// Create/Update parameters
export interface UploadCreateParams {
  url?: string;
  path?: string;
  id?: string;
  filename?: string;
  skipCreationIfAlreadyExists?: boolean;
  author?: string | null;
  copyright?: string | null;
  notes?: string | null;
  tags?: string[];
  default_field_metadata?: Record<string, Record<string, any>>;
  upload_collection?: {
    type: 'upload_collection';
    id: string;
  } | null;
}

export interface UploadUpdateParams {
  path?: string;
  basename?: string;
  copyright?: string | null;
  author?: string | null;
  notes?: string | null;
  tags?: string[];
  default_field_metadata?: Record<string, any>;
  upload_collection?: {
    type: 'upload_collection';
    id: string;
  } | null;
}

export interface UploadCollectionCreateParams {
  label: string;
  id?: string;
  position?: number;
  parent?: {
    type: 'upload_collection';
    id: string;
  };
}

export interface UploadCollectionUpdateParams {
  label?: string;
  position?: number;
  parent?: {
    type: 'upload_collection';
    id: string;
  } | null;
  children?: {
    type: 'upload_collection';
    id: string;
  }[];
}

// Error types
export type UploadsErrorType = 
  | 'uploads_error' 
  | 'uploads_validation_error' 
  | 'uploads_not_found_error' 
  | 'uploads_auth_error';

export interface UploadsError {
  type: UploadsErrorType;
  message: string;
  details?: string;
}

export interface UploadsValidationError extends UploadsError {
  type: 'uploads_validation_error';
  validationErrors: Array<{
    field?: string;
    message: string;
  }>;
}

export interface UploadsNotFoundError extends UploadsError {
  type: 'uploads_not_found_error';
  resourceId: string;
  resourceType: 'upload' | 'upload_collection' | 'tag' | 'smart_tag';
}

export interface UploadsAuthorizationError extends UploadsError {
  type: 'uploads_auth_error';
}

// Type guards for error handling
export function isUploadsError(error: unknown): error is UploadsError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as UploadsError).type === 'string' &&
    (error as UploadsError).type.startsWith('uploads_') &&
    'message' in error &&
    typeof (error as UploadsError).message === 'string'
  );
}

export function isUploadsValidationError(error: unknown): error is UploadsValidationError {
  return (
    isUploadsError(error) &&
    (error as UploadsError).type === 'uploads_validation_error' &&
    'validationErrors' in error &&
    Array.isArray((error as UploadsValidationError).validationErrors)
  );
}

export function isUploadsNotFoundError(error: unknown): error is UploadsNotFoundError {
  return (
    isUploadsError(error) &&
    (error as UploadsError).type === 'uploads_not_found_error' &&
    'resourceId' in error &&
    'resourceType' in error
  );
}

export function isUploadsAuthorizationError(error: unknown): error is UploadsAuthorizationError {
  return isUploadsError(error) && (error as UploadsError).type === 'uploads_auth_error';
}

// Response types
export interface UploadsSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface UploadsErrorResponse {
  success: false;
  error: string;
  message?: string;
  validationErrors?: Array<{
    field?: string;
    message: string;
  }>;
}

export type UploadsResponse<T> = UploadsSuccessResponse<T> | UploadsErrorResponse;

// Upload responses
export type GetUploadResponse = UploadsResponse<Upload>;
export type ListUploadsResponse = UploadsResponse<Upload[]>;
export type CreateUploadResponse = UploadsResponse<Upload>;
export type UpdateUploadResponse = UploadsResponse<Upload>;
export type DeleteUploadResponse = UploadsResponse<void>;
export type GetUploadReferencesResponse = UploadsResponse<UploadReference[]>;
export type BulkUploadOperationResponse = UploadsResponse<{
  successful: string[];
  failed: Record<string, string>;
}>;

// UploadCollection responses
export type GetUploadCollectionResponse = UploadsResponse<UploadCollection>;
export type ListUploadCollectionsResponse = UploadsResponse<UploadCollection[]>;
export type CreateUploadCollectionResponse = UploadsResponse<UploadCollection>;
export type UpdateUploadCollectionResponse = UploadsResponse<UploadCollection>;
export type DeleteUploadCollectionResponse = UploadsResponse<void>;

// Tag responses
export type ListUploadTagsResponse = UploadsResponse<UploadTag[]>;
export type CreateUploadTagResponse = UploadsResponse<UploadTag>;
export type ListUploadSmartTagsResponse = UploadsResponse<UploadSmartTag[]>;