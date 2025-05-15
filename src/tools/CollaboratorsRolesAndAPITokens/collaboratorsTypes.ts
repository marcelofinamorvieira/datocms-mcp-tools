/**
 * Type definitions for the CollaboratorsRolesAndAPITokens module.
 * This file contains type definitions for collaborators, roles, API tokens, and related entities.
 */

// Common Types
export type CollaboratorsErrorType = 
  | 'collaborators_error' 
  | 'collaborators_validation_error' 
  | 'collaborators_not_found_error' 
  | 'collaborators_auth_error';

export interface CollaboratorsError {
  type: CollaboratorsErrorType;
  message: string;
  details?: string;
}

export type ValidationFieldError = {
  field: string;
  message: string;
};

export interface CollaboratorsValidationError extends CollaboratorsError {
  type: 'collaborators_validation_error';
  validationErrors: ValidationFieldError[];
}

export type CollaboratorsResponse<T> = 
  | { success: true; data: T } 
  | { success: false; error: string; validationErrors?: ValidationFieldError[] };

// Type Guards
export function isCollaboratorsError(error: unknown): error is CollaboratorsError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as CollaboratorsError).type === 'string' &&
    (error as CollaboratorsError).type.startsWith('collaborators_') &&
    'message' in error &&
    typeof (error as CollaboratorsError).message === 'string'
  );
}

export function isCollaboratorsValidationError(error: unknown): error is CollaboratorsValidationError {
  return (
    isCollaboratorsError(error) &&
    (error as CollaboratorsError).type === 'collaborators_validation_error' &&
    'validationErrors' in error &&
    Array.isArray((error as CollaboratorsValidationError).validationErrors)
  );
}

export function isCollaboratorsAuthError(error: unknown): error is CollaboratorsError {
  return isCollaboratorsError(error) && (error as CollaboratorsError).type === 'collaborators_auth_error';
}

// API Token Types
export type APITokenIdentity = string;
export type APITokenType = 'api_token';

export interface APIToken {
  id: APITokenIdentity;
  type: APITokenType;
  attributes: {
    name: string;
    token?: string | null; // Only included when created or rotated
    hardcoded_type: string | null;
    created_at: string;
    updated_at: string;
    can_access_cda?: boolean;
    can_access_cda_preview?: boolean;
    can_access_cma?: boolean;
  };
  relationships: {
    role: {
      data: {
        id: RoleIdentity;
        type: RoleType;
      } | null;
    };
    creator: {
      data: {
        id: CollaboratorIdentity;
        type: CollaboratorType;
      } | null;
    };
  };
}

export interface CreateAPITokenParams {
  name: string;
  role: { id: string; type: RoleType };
  can_access_cda: boolean;
  can_access_cda_preview: boolean;
  can_access_cma: boolean;
}

export interface UpdateAPITokenParams {
  name: string;
  role?: { id: string; type: RoleType };
  can_access_cda: boolean;
  can_access_cda_preview: boolean;
  can_access_cma: boolean;
}

// Role Types
export type RoleIdentity = string;
export type RoleType = 'role';
export type RoleAction = 
  | 'admin.access' 
  | 'items.publish' 
  | 'environments.create' 
  | 'schema.edit'
  | 'media_library.edit'
  | 'users.invite'
  | 'webhooks.edit'
  | 'build_triggers.edit';

export interface Role {
  id: RoleIdentity;
  type: RoleType;
  attributes: {
    name: string;
    can_destroy: boolean;
    can_edit: boolean;
    positive_actions: RoleAction[];
    negative_actions: RoleAction[];
    can_edit_favicon: boolean;
    created_at: string;
    updated_at: string;
  };
  relationships?: {
    users?: {
      data: {
        id: CollaboratorIdentity;
        type: CollaboratorType;
      }[];
    };
    api_tokens?: {
      data: {
        id: APITokenIdentity;
        type: APITokenType;
      }[];
    };
  };
}

export interface CreateRoleParams {
  name: string;
  positive_actions?: RoleAction[];
  negative_actions?: RoleAction[];
  can_edit_favicon?: boolean;
}

export interface UpdateRoleParams {
  name?: string;
  positive_actions?: RoleAction[];
  negative_actions?: RoleAction[];
  can_edit_favicon?: boolean;
}

// Collaborator Types
export type CollaboratorIdentity = string;
export type CollaboratorType = 'user';

export interface Collaborator {
  id: CollaboratorIdentity;
  type: CollaboratorType;
  attributes: {
    email: string;
    first_name: string | null;
    last_name: string | null;
    avatar: {
      upload_id: string | null;
      url: string | null;
    };
    is_active: boolean;
    is_primary_admin: boolean;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    role: {
      data: {
        id: RoleIdentity;
        type: RoleType;
      };
    };
  };
}

export interface UpdateCollaboratorParams {
  first_name?: string;
  last_name?: string;
  role?: { id: string; type: RoleType };
}

// Invitation Types
export type InvitationIdentity = string;
export type InvitationType = 'user_invitation';

export interface Invitation {
  id: InvitationIdentity;
  type: InvitationType;
  attributes: {
    email: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    role: {
      data: {
        id: RoleIdentity;
        type: RoleType;
      };
    };
    creator: {
      data: {
        id: CollaboratorIdentity;
        type: CollaboratorType;
      } | null;
    };
  };
}

export interface CreateInvitationParams {
  email: string;
  role: { id: string; type: RoleType };
}

// Response Types
export type GetCollaboratorResponse = CollaboratorsResponse<Collaborator>;
export type ListCollaboratorsResponse = CollaboratorsResponse<Collaborator[]>;
export type UpdateCollaboratorResponse = CollaboratorsResponse<Collaborator>;
export type DestroyCollaboratorResponse = CollaboratorsResponse<Record<string, never>>;

export type GetInvitationResponse = CollaboratorsResponse<Invitation>;
export type ListInvitationsResponse = CollaboratorsResponse<Invitation[]>;
export type CreateInvitationResponse = CollaboratorsResponse<Invitation>;
export type DestroyInvitationResponse = CollaboratorsResponse<Record<string, never>>;
export type ResendInvitationResponse = CollaboratorsResponse<Record<string, never>>;

export type GetRoleResponse = CollaboratorsResponse<Role>;
export type ListRolesResponse = CollaboratorsResponse<Role[]>;
export type CreateRoleResponse = CollaboratorsResponse<Role>;
export type UpdateRoleResponse = CollaboratorsResponse<Role>;
export type DestroyRoleResponse = CollaboratorsResponse<Record<string, never>>;
export type DuplicateRoleResponse = CollaboratorsResponse<Role>;

export type GetAPITokenResponse = CollaboratorsResponse<APIToken>;
export type ListAPITokensResponse = CollaboratorsResponse<APIToken[]>;
export type CreateAPITokenResponse = CollaboratorsResponse<APIToken>;
export type UpdateAPITokenResponse = CollaboratorsResponse<APIToken>;
export type DestroyAPITokenResponse = CollaboratorsResponse<Record<string, never>>;
export type RotateAPITokenResponse = CollaboratorsResponse<APIToken>;