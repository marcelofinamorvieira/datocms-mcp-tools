import { z } from "zod";
import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { roleSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler for updating a role in DatoCMS
 */
export const updateRoleHandler = createUpdateHandler<
  z.infer<typeof roleSchemas.update_role>,
  SimpleSchemaTypes.Role
>({
  domain: "collaborators.roles",
  schemaName: "update_role",
  schema: roleSchemas.update_role,
  entityName: "Role",
  idParam: "roleId",
  successMessage: (result) => `Role '${result.name}' updated successfully.`,
  clientAction: async (client, args) => {
    const {
      roleId,
      name,
      can_edit_schema,
      can_edit_others_content,
      can_publish_content,
      can_edit_favicon,
      can_access_environments,
      can_perform_site_search,
      can_edit_site_entity
    } = args;

    // Prepare role update payload, filtering out undefined values
    const rolePayload = {
      ...(name !== undefined && { name }),
      ...(can_edit_schema !== undefined && { can_edit_schema }),
      ...(can_edit_others_content !== undefined && { can_edit_others_content }),
      ...(can_publish_content !== undefined && { can_publish_content }),
      ...(can_edit_favicon !== undefined && { can_edit_favicon }),
      ...(can_access_environments !== undefined && { can_access_environments }),
      ...(can_perform_site_search !== undefined && { can_perform_site_search }),
      ...(can_edit_site_entity !== undefined && { can_edit_site_entity }),
    };

    // Update the role
    return await client.roles.update(roleId, rolePayload);
  }
});