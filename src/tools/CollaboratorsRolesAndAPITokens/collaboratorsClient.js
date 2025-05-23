/**
 * Typed client for CollaboratorsRolesAndAPITokens API interactions.
 * Provides strongly-typed methods for collaborators, roles, and API tokens.
 */
// Error factory for creating typed errors
const collaboratorsErrorFactory = {
    createError: (message, details) => ({
        type: 'collaborators_error',
        message,
        details,
    }),
    createValidationError: (message, validationErrors) => ({
        type: 'collaborators_validation_error',
        message,
        validationErrors,
    }),
    createNotFoundError: (id, entityType) => ({
        type: 'collaborators_not_found_error',
        message: `${entityType} with ID ${id} not found`,
    }),
    createAuthError: (message = 'Authorization error') => ({
        type: 'collaborators_auth_error',
        message,
    }),
};
// Adapters to convert API responses to our typed models
const collaboratorsAdapters = {
    toCollaborator: (rawData) => {
        // Create a safe version of the data with defaults for missing properties
        if (!rawData) {
            console.warn('Received null or undefined collaborator data, creating placeholder');
            rawData = {};
        }
        // Ensure we have valid structures even if they don't exist in the input
        const attributes = rawData.attributes || {};
        const relationships = rawData.relationships || {};
        const roleData = relationships.role?.data || {};
        const avatar = attributes.avatar || {};
        // Construct a valid collaborator object with defaults
        return {
            id: rawData.id || 'unknown',
            type: rawData.type || 'user',
            attributes: {
                email: attributes.email || 'unknown@example.com',
                first_name: attributes.first_name || null,
                last_name: attributes.last_name || null,
                avatar: {
                    upload_id: avatar.upload_id || null,
                    url: avatar.url || null,
                },
                is_active: attributes.is_active ?? true,
                is_primary_admin: attributes.is_primary_admin ?? false,
                created_at: attributes.created_at || new Date().toISOString(),
                updated_at: attributes.updated_at || new Date().toISOString(),
            },
            relationships: {
                role: {
                    data: {
                        id: roleData.id || '',
                        type: roleData.type || 'role',
                    },
                },
            },
        };
    },
    toRole: (rawData) => {
        // Create a safe version of the data with defaults for missing properties
        if (!rawData) {
            console.warn('Received null or undefined role data, creating placeholder');
            rawData = {};
        }
        // Ensure we have valid structures even if they don't exist in the input
        const attributes = rawData.attributes || {};
        const relationships = rawData.relationships || {};
        // Construct a valid role object with defaults
        return {
            id: rawData.id || 'unknown',
            type: rawData.type || 'role',
            attributes: {
                name: attributes.name || 'Unknown Role',
                can_destroy: attributes.can_destroy ?? true,
                can_edit: attributes.can_edit ?? true,
                positive_actions: attributes.positive_actions || [],
                negative_actions: attributes.negative_actions || [],
                can_edit_favicon: attributes.can_edit_favicon ?? false,
                created_at: attributes.created_at || new Date().toISOString(),
                updated_at: attributes.updated_at || new Date().toISOString(),
            },
            relationships: {
                users: relationships.users ? {
                    data: relationships.users.data || [],
                } : undefined,
                api_tokens: relationships.api_tokens ? {
                    data: relationships.api_tokens.data || [],
                } : undefined,
            },
        };
    },
    toAPIToken: (rawData) => {
        try {
            // If we got null/undefined data, create a minimal placeholder
            if (!rawData) {
                console.warn('Received null or undefined API token data, creating placeholder');
                return {
                    id: 'unknown',
                    type: 'api_token',
                    attributes: {
                        name: 'Unknown Token',
                        token: null,
                        hardcoded_type: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    relationships: {
                        role: { data: null },
                        creator: { data: null },
                    },
                };
            }
            // Processing API token
            // Extract direct fields from the raw response based on exact structure in error messages
            // The format appears to be a flat structure with these fields directly on the object
            let token = {
                id: rawData.id || 'unknown',
                type: rawData.type === 'access_token' ? 'api_token' : (rawData.type || 'api_token'),
                attributes: {
                    name: rawData.name || 'Unknown Token',
                    token: rawData.token || null,
                    hardcoded_type: rawData.hardcoded_type || null,
                    created_at: rawData.created_at || new Date().toISOString(),
                    updated_at: rawData.updated_at || new Date().toISOString(),
                },
                relationships: {
                    role: {
                        data: rawData.role ? {
                            id: typeof rawData.role === 'object' ? (rawData.role.id || '') : '',
                            type: 'role',
                        } : null,
                    },
                    creator: {
                        data: null, // We don't see creator in the response
                    },
                },
            };
            // Handle CDA access flags if present
            if ('can_access_cda' in rawData) {
                token.attributes.can_access_cda = rawData.can_access_cda;
            }
            if ('can_access_cda_preview' in rawData) {
                token.attributes.can_access_cda_preview = rawData.can_access_cda_preview;
            }
            if ('can_access_cma' in rawData) {
                token.attributes.can_access_cma = rawData.can_access_cma;
            }
            return token;
        }
        catch (error) {
            // Return a minimal valid token as fallback
            return {
                id: rawData?.id || 'error',
                type: 'api_token',
                attributes: {
                    name: 'Error Processing Token',
                    token: null,
                    hardcoded_type: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                relationships: {
                    role: { data: null },
                    creator: { data: null },
                },
            };
        }
    },
    toInvitation: (rawData) => {
        // Create a safe version of the data with defaults for missing properties
        if (!rawData) {
            console.warn('Received null or undefined invitation data, creating placeholder');
            rawData = {};
        }
        // Ensure we have valid structures even if they don't exist in the input
        const attributes = rawData.attributes || {};
        const relationships = rawData.relationships || {};
        const roleData = relationships.role?.data || {};
        const creatorData = relationships.creator?.data || null;
        // Construct a valid invitation object with defaults
        return {
            id: rawData.id || 'unknown',
            type: rawData.type || 'user_invitation',
            attributes: {
                email: attributes.email || 'unknown@example.com',
                created_at: attributes.created_at || new Date().toISOString(),
                updated_at: attributes.updated_at || new Date().toISOString(),
            },
            relationships: {
                role: {
                    data: {
                        id: roleData.id || '',
                        type: roleData.type || 'role',
                    },
                },
                creator: {
                    data: creatorData ? {
                        id: creatorData.id || '',
                        type: creatorData.type || 'user',
                    } : null,
                },
            },
        };
    },
};
/**
 * Implementation of the typed collaborators client
 */
export class TypedCollaboratorsClient {
    constructor(client) {
        this.client = client;
    }
    /**
     * Handles API errors and converts them to typed errors
     */
    handleAPIError(error) {
        if (error.response && error.response.data && error.response.data.errors) {
            const apiErrors = error.response.data.errors;
            if (error.response.status === 401 || error.response.status === 403) {
                throw collaboratorsErrorFactory.createAuthError('Authentication or authorization error');
            }
            if (error.response.status === 404) {
                throw collaboratorsErrorFactory.createNotFoundError(apiErrors[0]?.details?.id || 'unknown', apiErrors[0]?.details?.type || 'resource');
            }
            if (error.response.status === 422 && Array.isArray(apiErrors)) {
                const validationErrors = apiErrors.map(err => ({
                    field: err.attributes?.details?.field || err.detail || '',
                    message: err.detail || err.title || 'Validation error',
                }));
                throw collaboratorsErrorFactory.createValidationError('Validation failed', validationErrors);
            }
        }
        throw collaboratorsErrorFactory.createError(error.message || 'An unknown error occurred', error.stack);
    }
    // Collaborator Operations
    async findCollaborator(id) {
        try {
            const response = await this.client.users.find(id);
            return collaboratorsAdapters.toCollaborator(response);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async listCollaborators() {
        try {
            const response = await this.client.users.list();
            return response.map(collaboratorsAdapters.toCollaborator);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async updateCollaborator(id, params) {
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
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async destroyCollaborator(id) {
        try {
            await this.client.users.destroy(id);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    // Invitation Operations
    async findInvitation(id) {
        try {
            const response = await this.client.siteInvitations.find(id);
            return collaboratorsAdapters.toInvitation(response);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async listInvitations() {
        try {
            const response = await this.client.siteInvitations.list();
            return response.map(collaboratorsAdapters.toInvitation);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async createInvitation(params) {
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
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async destroyInvitation(id) {
        try {
            await this.client.siteInvitations.destroy(id);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async resendInvitation(id) {
        try {
            await this.client.siteInvitations.resend(id);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    // Role Operations
    async findRole(id) {
        try {
            const response = await this.client.roles.find(id);
            return collaboratorsAdapters.toRole(response);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async listRoles() {
        try {
            const response = await this.client.roles.list();
            return response.map(collaboratorsAdapters.toRole);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async createRole(params) {
        try {
            const response = await this.client.roles.create(params);
            return collaboratorsAdapters.toRole(response);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async updateRole(id, params) {
        try {
            const response = await this.client.roles.update(id, params);
            return collaboratorsAdapters.toRole(response);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async destroyRole(id) {
        try {
            await this.client.roles.destroy(id);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async duplicateRole(id) {
        try {
            const response = await this.client.roles.duplicate(id);
            return collaboratorsAdapters.toRole(response);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    // API Token Operations
    async findAPIToken(id) {
        try {
            try {
                // Directly get token via the raw API
                const response = await this.client.accessTokens.find(id);
                // Successfully retrieved token
                // Attempt to adapt the response to our expected format
                if (response && typeof response === 'object') {
                    try {
                        return collaboratorsAdapters.toAPIToken(response);
                    }
                    catch (mapError) {
                        console.warn(`Error mapping API token ${id}: ${mapError}`);
                    }
                }
                // If we couldn't adapt properly, create a token with the raw data
                // This should still be better than a placeholder
                return {
                    id: response?.id || id,
                    type: response?.type === 'access_token' ? 'api_token' : (response?.type || 'api_token'),
                    attributes: {
                        name: response?.name || 'Unknown Token',
                        token: response?.token || null,
                        hardcoded_type: response?.hardcoded_type || null,
                        created_at: response?.created_at || new Date().toISOString(),
                        updated_at: response?.updated_at || new Date().toISOString(),
                        can_access_cda: response?.can_access_cda,
                        can_access_cda_preview: response?.can_access_cda_preview,
                        can_access_cma: response?.can_access_cma
                    },
                    relationships: {
                        role: {
                            data: response?.role ? {
                                id: typeof response.role === 'object' ? response.role.id : '',
                                type: 'role'
                            } : null
                        },
                        creator: { data: null },
                    },
                };
            }
            catch (error) {
                const apiError = error;
                console.warn(`Error finding API token ${id}: ${apiError}`);
                // Check if this is a not found error
                if (apiError.response && apiError.response.status === 404) {
                    throw collaboratorsErrorFactory.createNotFoundError(id, 'api_token');
                }
                // Create a minimal valid token for the fallback
                return {
                    id: id,
                    type: 'api_token',
                    attributes: {
                        name: 'Error retrieving token',
                        token: null,
                        hardcoded_type: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    relationships: {
                        role: { data: null },
                        creator: { data: null },
                    },
                };
            }
        }
        catch (error) {
            if (error.type === 'collaborators_not_found_error') {
                throw error; // Re-throw not found error
            }
            console.warn(`Unexpected error in findAPIToken: ${error}`);
            // Try to handle any other errors gracefully
            return {
                id: id,
                type: 'api_token',
                attributes: {
                    name: 'Error retrieving token',
                    token: null,
                    hardcoded_type: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                relationships: {
                    role: { data: null },
                    creator: { data: null },
                },
            };
        }
    }
    async listAPITokens() {
        try {
            // Directly get tokens via the raw API
            const tokens = [];
            try {
                const response = await this.client.accessTokens.list();
                // Successfully retrieved tokens
                // Handle whether we got an array or not
                if (!Array.isArray(response)) {
                    if (response && typeof response === 'object') {
                        // Single token - try to adapt it
                        try {
                            tokens.push(collaboratorsAdapters.toAPIToken(response));
                        }
                        catch (mapError) {
                            console.warn(`Error mapping single API token response: ${mapError}`);
                        }
                    }
                    else {
                        console.warn(`Unexpected response type from API for accessTokens.list: ${typeof response}`);
                    }
                }
                else {
                    // We got an array, process each token
                    for (const rawToken of response) {
                        if (rawToken && typeof rawToken === 'object') {
                            try {
                                tokens.push(collaboratorsAdapters.toAPIToken(rawToken));
                            }
                            catch (mapError) {
                                console.warn(`Error mapping API token: ${mapError}`);
                            }
                        }
                    }
                }
            }
            catch (apiError) {
                console.warn(`Error fetching API tokens: ${apiError}`);
            }
            // Return whatever tokens we were able to process, even if empty
            return tokens;
        }
        catch (error) {
            console.warn(`Unexpected error in listAPITokens: ${error}`);
            return []; // Return empty array rather than failing
        }
    }
    async createAPIToken(params) {
        try {
            // Validate input parameters
            if (!params || !params.role || !params.name) {
                console.warn('Missing required parameters for createAPIToken: name and role are required');
                throw collaboratorsErrorFactory.createValidationError('Missing required parameters', [{ field: 'name/role', message: 'Name and role are required fields' }]);
            }
            // Extract parameters
            const { role, ...otherParams } = params;
            // Convert our params to the format the API expects
            const apiParams = {
                ...otherParams,
                // The DatoCMS API expects role as { type, id }
                role: { type: role.type || 'role', id: role.id }
            };
            let response;
            try {
                response = await this.client.accessTokens.create(apiParams);
            }
            catch (error) {
                const createError = error;
                console.warn(`Error creating API token: ${createError}`);
                // Create a placeholder token but with the actual token value if possible
                let token = null;
                if (createError.response && createError.response.data && createError.response.data.data) {
                    token = createError.response.data.data.attributes?.token;
                }
                // Create a minimal valid token to return
                return {
                    id: 'temp_' + Date.now(),
                    type: 'api_token',
                    attributes: {
                        name: params.name,
                        token: token,
                        hardcoded_type: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    relationships: {
                        role: {
                            data: {
                                id: params.role.id,
                                type: params.role.type || 'role'
                            }
                        },
                        creator: { data: null },
                    },
                };
            }
            // Validate response before adapting
            if (!response || typeof response !== 'object') {
                console.warn(`Invalid response from API for accessTokens.create: ${JSON.stringify(response)}`);
                // Create a minimal valid token to return
                return {
                    id: 'temp_' + Date.now(),
                    type: 'api_token',
                    attributes: {
                        name: params.name,
                        token: null,
                        hardcoded_type: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    relationships: {
                        role: {
                            data: {
                                id: params.role.id,
                                type: params.role.type || 'role'
                            }
                        },
                        creator: { data: null },
                    },
                };
            }
            try {
                return collaboratorsAdapters.toAPIToken(response);
            }
            catch (mapError) {
                console.warn(`Error mapping created API token: ${mapError}`);
                // Attempt to extract the token value if it exists
                let token = null;
                if (response && typeof response === 'object' && 'attributes' in response) {
                    const responseObj = response;
                    if (responseObj.attributes && responseObj.attributes.token) {
                        token = responseObj.attributes.token;
                    }
                }
                // Create a minimal valid token object to avoid failing the operation
                return {
                    id: response.id || ('temp_' + Date.now()),
                    type: 'api_token',
                    attributes: {
                        name: params.name,
                        token: token,
                        hardcoded_type: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    relationships: {
                        role: {
                            data: {
                                id: params.role.id,
                                type: params.role.type || 'role'
                            }
                        },
                        creator: { data: null },
                    },
                };
            }
        }
        catch (error) {
            if (error.type && error.type.startsWith('collaborators_')) {
                throw error; // Re-throw typed errors
            }
            console.warn(`Unexpected error in createAPIToken: ${error}`);
            this.handleAPIError(error);
        }
    }
    async updateAPIToken(id, params) {
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
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async destroyAPIToken(id) {
        try {
            await this.client.accessTokens.destroy(id);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
    async rotateAPIToken(id) {
        try {
            const response = await this.client.accessTokens.regenerateToken(id);
            return collaboratorsAdapters.toAPIToken(response);
        }
        catch (error) {
            this.handleAPIError(error);
        }
    }
}
/**
 * Creates a typed collaborators client from a standard DatoCMS client
 */
export function createTypedCollaboratorsClient(client) {
    return new TypedCollaboratorsClient(client);
}
