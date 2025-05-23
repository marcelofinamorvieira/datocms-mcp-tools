import { z } from "zod";
import { baseToolSchema } from "../../utils/sharedSchemas.js";

/**
 * Schemas for all collaborator-related actions.
 * These schemas are used for both the collaborators router and parameter tools.
 */
export const collaboratorSchemas = {
  // Invitation operations
  invitation_create: baseToolSchema.extend({
    email: z.string().email().describe("Email address for the invitation recipient"),
    role: z.union([
      z.enum(["admin", "editor", "developer", "seo", "contributor"]),
      z.string().regex(/^[0-9]+$/).describe("Role ID"),
      z.object({
        id: z.string().describe("Role ID"),
        type: z.literal("role").describe("Resource type")
      })
    ]).describe("Role to assign to the invited user")
  }),

  invitation_list: baseToolSchema,

  invitation_retrieve: baseToolSchema.extend({
    invitationId: z.string().describe("ID of the invitation to retrieve")
  }),

  invitation_destroy: baseToolSchema.extend({
    invitationId: z.string().describe("ID of the invitation to delete")
  }),

  invitation_resend: baseToolSchema.extend({
    invitationId: z.string().describe("ID of the invitation to resend")
  }),

  // User operations
  user_list: baseToolSchema,

  user_retrieve: baseToolSchema.extend({
    userId: z.string().describe("ID of the user to retrieve")
  }),

  user_update: baseToolSchema.extend({
    userId: z.string().describe("ID of the user to update"),
    email: z.string().email().optional().describe("Email of the user"),
    first_name: z.string().optional().describe("First name of the user"),
    last_name: z.string().optional().describe("Last name of the user"),
    role_id: z.string().optional().describe("Role ID to assign to the user")
  }),

  user_destroy: baseToolSchema.extend({
    userId: z.string().describe("ID of the user to destroy")
  }),

  user_invite: baseToolSchema.extend({
    email: z.string().email().describe("Email of the user to invite"),
    role_id: z.string().describe("Role ID to assign to the user"),
    first_name: z.string().optional().describe("First name of the user"),
    last_name: z.string().optional().describe("Last name of the user")
  })
};

// Create an array of all available collaborator actions for the enum
export const collaboratorActionsList = Object.keys(collaboratorSchemas) as Array<keyof typeof collaboratorSchemas>;

// Common action enums for roles
export const roleActionEnum = z.enum([
  "create_role",
  "list_roles",
  "retrieve_role",
  "update_role",
  "destroy_role",
  "duplicate_role",
]);

// Schema for creating a role
export const createRoleSchema = baseToolSchema.extend({
  name: z.string().describe("Name of the role"),
  can_edit_schema: z.boolean().optional().describe("Whether the role can edit schema"),
  can_edit_others_content: z.boolean().optional().describe("Whether the role can edit content created by other users"),
  can_publish_content: z.boolean().optional().describe("Whether the role can publish content"),
  can_edit_favicon: z.boolean().optional().describe("Whether the role can edit the favicon"),
  can_access_environments: z.boolean().optional().describe("Whether the role can access environments"),
  can_perform_site_search: z.boolean().optional().describe("Whether the role can perform site search"),
  can_edit_site_entity: z.boolean().optional().describe("Whether the role can edit site entity")
});

// Schema for listing roles
export const listRolesSchema = baseToolSchema;

// Schema for retrieving a role
export const retrieveRoleSchema = baseToolSchema.extend({
  roleId: z.string().describe("ID of the role to retrieve")
});

// Schema for updating a role
export const updateRoleSchema = baseToolSchema.extend({
  roleId: z.string().describe("ID of the role to update"),
  name: z.string().optional().describe("Name of the role"),
  can_edit_schema: z.boolean().optional().describe("Whether the role can edit schema"),
  can_edit_others_content: z.boolean().optional().describe("Whether the role can edit content created by other users"),
  can_publish_content: z.boolean().optional().describe("Whether the role can publish content"),
  can_edit_favicon: z.boolean().optional().describe("Whether the role can edit the favicon"),
  can_access_environments: z.boolean().optional().describe("Whether the role can access environments"),
  can_perform_site_search: z.boolean().optional().describe("Whether the role can perform site search"),
  can_edit_site_entity: z.boolean().optional().describe("Whether the role can edit site entity")
});

// Schema for destroying a role
export const destroyRoleSchema = baseToolSchema.extend({
  roleId: z.string().describe("ID of the role to destroy")
});

// Schema for duplicating a role
export const duplicateRoleSchema = baseToolSchema.extend({
  roleId: z.string().describe("ID of the role to duplicate")
});

// Export schemas by action for easy access
export const roleSchemas = {
  create_role: createRoleSchema,
  list_roles: listRolesSchema,
  retrieve_role: retrieveRoleSchema,
  update_role: updateRoleSchema,
  destroy_role: destroyRoleSchema,
  duplicate_role: duplicateRoleSchema,
} as const;

// Common action enums for API tokens
export const apiTokenActionEnum = z.enum([
  "create_token",
  "list_tokens",
  "retrieve_token",
  "update_token",
  "destroy_token",
  "rotate_token",
]);

// Schema for creating an API token
export const createTokenSchema = baseToolSchema.extend({
  name: z.string().describe("Name of the API token"),
  role: z.union([
    z.enum(["admin", "editor", "developer", "seo", "contributor"]),
    z.string().regex(/^[0-9]+$/).describe("Role ID"),
    z.object({
      id: z.string().describe("Role ID"),
      type: z.literal("role").describe("Resource type")
    })
  ]).describe("Role to assign to the API token"),
  can_access_cda: z.boolean().describe("Whether the token can access the Content Delivery API published content"),
  can_access_cda_preview: z.boolean().describe("Whether the token can access the Content Delivery API draft content"),
  can_access_cma: z.boolean().describe("Whether the token can access the Content Management API")
});

// Schema for listing API tokens
export const listTokensSchema = baseToolSchema;

// Schema for retrieving an API token
export const retrieveTokenSchema = baseToolSchema.extend({
  tokenId: z.string().describe("ID of the API token to retrieve")
});

// Schema for updating an API token
export const updateTokenSchema = baseToolSchema.extend({
  tokenId: z.string().describe("ID of the API token to update"),
  name: z.string().describe("Name of the API token"),
  role: z.union([
    z.enum(["admin", "editor", "developer", "seo", "contributor"]),
    z.string().regex(/^[0-9]+$/).describe("Role ID"),
    z.object({
      id: z.string().describe("Role ID"),
      type: z.literal("role").describe("Resource type")
    }),
    z.null()
  ]).describe("Role to assign to the API token (can be null)"),
  can_access_cda: z.boolean().describe("Whether the token can access the Content Delivery API published content"),
  can_access_cda_preview: z.boolean().describe("Whether the token can access the Content Delivery API draft content"),
  can_access_cma: z.boolean().describe("Whether the token can access the Content Management API")
});

// Schema for destroying an API token
export const destroyTokenSchema = baseToolSchema.extend({
  tokenId: z.string().describe("ID of the API token to destroy")
});

// Schema for rotating an API token
export const rotateTokenSchema = baseToolSchema.extend({
  tokenId: z.string().describe("ID of the API token to rotate")
});

// Export schemas by action for easy access
export const apiTokenSchemas = {
  create_token: createTokenSchema,
  list_tokens: listTokensSchema,
  retrieve_token: retrieveTokenSchema,
  update_token: updateTokenSchema,
  destroy_token: destroyTokenSchema,
  rotate_token: rotateTokenSchema,
} as const;