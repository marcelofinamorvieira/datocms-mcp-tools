/**
 * Typed client for CollaboratorsRolesAndAPITokens API interactions.
 * Provides strongly-typed methods for collaborators, roles, and API tokens.
 */

import { Client } from '@datocms/cma-client-node';
import {
  APIToken,
  APITokenIdentity,
  Collaborator,
  CollaboratorIdentity,
  CollaboratorsError,
  CollaboratorsValidationError,
  CreateAPITokenParams,
  CreateInvitationParams,
  CreateRoleParams,
  Invitation,
  InvitationIdentity,
  Role,
  RoleIdentity,
  UpdateAPITokenParams,
  UpdateCollaboratorParams,
  UpdateRoleParams,
  ValidationFieldError,
} from './collaboratorsTypes.js';

// Error factory for creating typed errors
const collaboratorsErrorFactory = {
  createError: (message: string, details?: string): CollaboratorsError => ({
    type: 'collaborators_error',
    message,
    details,
  }),

  createValidationError: (message: string, validationErrors: Array<{ field: string; message: string }>): CollaboratorsValidationError => ({
    type: 'collaborators_validation_error',
    message,
    validationErrors,
  }),

  createNotFoundError: (id: string, entityType: string): CollaboratorsError => ({
    type: 'collaborators_not_found_error',
    message: `${entityType} with ID ${id} not found`,
  }),

  createAuthError: (message = 'Authorization error'): CollaboratorsError => ({
    type: 'collaborators_auth_error',
    message,
  }),
};

// Adapters to convert API responses to our typed models
const collaboratorsAdapters = {
  toCollaborator: (rawData: any): Collaborator => ({
    id: rawData.id,
    type: rawData.type,
    attributes: {
      email: rawData.attributes.email,
      first_name: rawData.attributes.first_name,
      last_name: rawData.attributes.last_name,
      avatar: {
        upload_id: rawData.attributes.avatar?.upload_id || null,
        url: rawData.attributes.avatar?.url || null,
      },
      is_active: rawData.attributes.is_active,
      is_primary_admin: rawData.attributes.is_primary_admin,
      created_at: rawData.attributes.created_at,
      updated_at: rawData.attributes.updated_at,
    },
    relationships: {
      role: {
        data: {
          id: rawData.relationships.role.data.id,
          type: rawData.relationships.role.data.type,
        },
      },
    },
  }),

  toRole: (rawData: any): Role => ({
    id: rawData.id,
    type: rawData.type,
    attributes: {
      name: rawData.attributes.name,
      can_destroy: rawData.attributes.can_destroy,
      can_edit: rawData.attributes.can_edit,
      positive_actions: rawData.attributes.positive_actions || [],
      negative_actions: rawData.attributes.negative_actions || [],
      can_edit_favicon: rawData.attributes.can_edit_favicon,
      created_at: rawData.attributes.created_at,
      updated_at: rawData.attributes.updated_at,
    },
    relationships: rawData.relationships ? {
      users: rawData.relationships.users ? {
        data: rawData.relationships.users.data || [],
      } : undefined,
      api_tokens: rawData.relationships.api_tokens ? {
        data: rawData.relationships.api_tokens.data || [],
      } : undefined,
    } : undefined,
  }),

  toAPIToken: (rawData: any): APIToken => ({
    id: rawData.id,
    type: rawData.type,
    attributes: {
      name: rawData.attributes.name,
      token: rawData.attributes.token,
      hardcoded_type: rawData.attributes.hardcoded_type,
      created_at: rawData.attributes.created_at,
      updated_at: rawData.attributes.updated_at,
    },
    relationships: {
      role: {
        data: {
          id: rawData.relationships.role.data.id,
          type: rawData.relationships.role.data.type,
        },
      },
      creator: {
        data: rawData.relationships.creator.data ? {
          id: rawData.relationships.creator.data.id,
          type: rawData.relationships.creator.data.type,
        } : null,
      },
    },
  }),

  toInvitation: (rawData: any): Invitation => ({
    id: rawData.id,
    type: rawData.type,
    attributes: {
      email: rawData.attributes.email,
      created_at: rawData.attributes.created_at,
      updated_at: rawData.attributes.updated_at,
    },
    relationships: {
      role: {
        data: {
          id: rawData.relationships.role.data.id,
          type: rawData.relationships.role.data.type,
        },
      },
      creator: {
        data: rawData.relationships.creator.data ? {
          id: rawData.relationships.creator.data.id,
          type: rawData.relationships.creator.data.type,
        } : null,
      },
    },
  }),
};

/**
 * Interface for the typed collaborators client
 */
export interface CollaboratorsClient {
  // Collaborator Operations
  findCollaborator(id: CollaboratorIdentity): Promise<Collaborator>;
  listCollaborators(): Promise<Collaborator[]>;
  updateCollaborator(id: CollaboratorIdentity, params: UpdateCollaboratorParams): Promise<Collaborator>;
  destroyCollaborator(id: CollaboratorIdentity): Promise<void>;
  
  // Invitation Operations
  findInvitation(id: InvitationIdentity): Promise<Invitation>;
  listInvitations(): Promise<Invitation[]>;
  createInvitation(params: CreateInvitationParams): Promise<Invitation>;
  destroyInvitation(id: InvitationIdentity): Promise<void>;
  resendInvitation(id: InvitationIdentity): Promise<void>;
  
  // Role Operations
  findRole(id: RoleIdentity): Promise<Role>;
  listRoles(): Promise<Role[]>;
  createRole(params: CreateRoleParams): Promise<Role>;
  updateRole(id: RoleIdentity, params: UpdateRoleParams): Promise<Role>;
  destroyRole(id: RoleIdentity): Promise<void>;
  duplicateRole(id: RoleIdentity): Promise<Role>;
  
  // API Token Operations
  findAPIToken(id: APITokenIdentity): Promise<APIToken>;
  listAPITokens(): Promise<APIToken[]>;
  createAPIToken(params: CreateAPITokenParams): Promise<APIToken>;
  updateAPIToken(id: APITokenIdentity, params: UpdateAPITokenParams): Promise<APIToken>;
  destroyAPIToken(id: APITokenIdentity): Promise<void>;
  rotateAPIToken(id: APITokenIdentity): Promise<APIToken>;
}

/**
 * Implementation of the typed collaborators client
 */
export class TypedCollaboratorsClient implements CollaboratorsClient {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Handles API errors and converts them to typed errors
   */
  private handleAPIError(error: any): never {
    if (error.response && error.response.data && error.response.data.errors) {
      const apiErrors = error.response.data.errors;
      
      if (error.response.status === 401 || error.response.status === 403) {
        throw collaboratorsErrorFactory.createAuthError('Authentication or authorization error');
      }
      
      if (error.response.status === 404) {
        throw collaboratorsErrorFactory.createNotFoundError(
          apiErrors[0]?.details?.id || 'unknown',
          apiErrors[0]?.details?.type || 'resource'
        );
      }
      
      if (error.response.status === 422 && Array.isArray(apiErrors)) {
        const validationErrors = apiErrors.map(err => ({
          field: err.attributes?.details?.field || err.detail || '',
          message: err.detail || err.title || 'Validation error',
        }));
        
        throw collaboratorsErrorFactory.createValidationError(
          'Validation failed',
          validationErrors
        );
      }
    }
    
    throw collaboratorsErrorFactory.createError(
      error.message || 'An unknown error occurred',
      error.stack
    );
  }

  // Collaborator Operations
  
  async findCollaborator(id: CollaboratorIdentity): Promise<Collaborator> {
    try {
      const response = await this.client.users.find(id);
      return collaboratorsAdapters.toCollaborator(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async listCollaborators(): Promise<Collaborator[]> {
    try {
      const response = await this.client.users.list();
      return response.map(collaboratorsAdapters.toCollaborator);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async updateCollaborator(id: CollaboratorIdentity, params: UpdateCollaboratorParams): Promise<Collaborator> {
    try {
      // Extract parameters
      const { role, ...otherParams } = params;
      
      // Convert our params to the format the API expects
      const apiParams = {
        ...otherParams,
        // The DatoCMS API expects role as { type, id }
        role: role ? { type: role.type, id: role.id } : undefined
      };
      
      const response = await this.client.users.update(id, apiParams);
      return collaboratorsAdapters.toCollaborator(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async destroyCollaborator(id: CollaboratorIdentity): Promise<void> {
    try {
      await this.client.users.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  // Invitation Operations
  
  async findInvitation(id: InvitationIdentity): Promise<Invitation> {
    try {
      const response = await this.client.siteInvitations.find(id);
      return collaboratorsAdapters.toInvitation(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async listInvitations(): Promise<Invitation[]> {
    try {
      const response = await this.client.siteInvitations.list();
      return response.map(collaboratorsAdapters.toInvitation);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async createInvitation(params: CreateInvitationParams): Promise<Invitation> {
    try {
      // Extract parameters
      const { role, ...otherParams } = params;
      
      // Convert our params to the format the API expects
      const apiParams = {
        ...otherParams,
        // The DatoCMS API expects role as { type, id }
        role: { type: role.type, id: role.id }
      };
      
      const response = await this.client.siteInvitations.create(apiParams);
      return collaboratorsAdapters.toInvitation(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async destroyInvitation(id: InvitationIdentity): Promise<void> {
    try {
      await this.client.siteInvitations.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async resendInvitation(id: InvitationIdentity): Promise<void> {
    try {
      await this.client.siteInvitations.resend(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  // Role Operations
  
  async findRole(id: RoleIdentity): Promise<Role> {
    try {
      const response = await this.client.roles.find(id);
      return collaboratorsAdapters.toRole(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async listRoles(): Promise<Role[]> {
    try {
      const response = await this.client.roles.list();
      return response.map(collaboratorsAdapters.toRole);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async createRole(params: CreateRoleParams): Promise<Role> {
    try {
      const response = await this.client.roles.create(params);
      return collaboratorsAdapters.toRole(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async updateRole(id: RoleIdentity, params: UpdateRoleParams): Promise<Role> {
    try {
      const response = await this.client.roles.update(id, params);
      return collaboratorsAdapters.toRole(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async destroyRole(id: RoleIdentity): Promise<void> {
    try {
      await this.client.roles.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async duplicateRole(id: RoleIdentity): Promise<Role> {
    try {
      const response = await this.client.roles.duplicate(id);
      return collaboratorsAdapters.toRole(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  // API Token Operations
  
  async findAPIToken(id: APITokenIdentity): Promise<APIToken> {
    try {
      const response = await this.client.accessTokens.find(id);
      return collaboratorsAdapters.toAPIToken(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async listAPITokens(): Promise<APIToken[]> {
    try {
      const response = await this.client.accessTokens.list();
      return response.map(collaboratorsAdapters.toAPIToken);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async createAPIToken(params: CreateAPITokenParams): Promise<APIToken> {
    try {
      // Extract parameters
      const { role, ...otherParams } = params;
      
      // Convert our params to the format the API expects
      const apiParams = {
        ...otherParams,
        // The DatoCMS API expects role as { type, id }
        role: { type: role.type, id: role.id }
      };
      
      const response = await this.client.accessTokens.create(apiParams);
      return collaboratorsAdapters.toAPIToken(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async updateAPIToken(id: APITokenIdentity, params: UpdateAPITokenParams): Promise<APIToken> {
    try {
      // Extract parameters
      const { role, ...otherParams } = params;
      
      // Convert our params to the format the API expects
      const apiParams = {
        ...otherParams,
        // The DatoCMS API expects role as { type, id } or null
        role: role ? { type: role.type, id: role.id } : null
      };
      
      const response = await this.client.accessTokens.update(id, apiParams);
      return collaboratorsAdapters.toAPIToken(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async destroyAPIToken(id: APITokenIdentity): Promise<void> {
    try {
      await this.client.accessTokens.destroy(id);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
  
  async rotateAPIToken(id: APITokenIdentity): Promise<APIToken> {
    try {
      const response = await this.client.accessTokens.regenerateToken(id);
      return collaboratorsAdapters.toAPIToken(response);
    } catch (error: any) {
      this.handleAPIError(error);
    }
  }
}

/**
 * Creates a typed collaborators client from a standard DatoCMS client
 */
export function createTypedCollaboratorsClient(client: Client): CollaboratorsClient {
  return new TypedCollaboratorsClient(client);
}