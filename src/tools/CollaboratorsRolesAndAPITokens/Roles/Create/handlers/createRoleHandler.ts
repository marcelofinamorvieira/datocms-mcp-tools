import { z } from "zod";
import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { roleSchemas } from "../../../schemas.js";

/**
 * Handler for creating a new role in DatoCMS
 */
export const createRoleHandler = createCreateHandler<
  z.infer<typeof roleSchemas.create_role>,
  any  // Role type from DatoCMS
>({
  domain: "collaborators.roles",
  schemaName: "create_role",
  schema: roleSchemas.create_role,
  entityName: "Role",
  successMessage: (result: { id: string; attributes: { name: string } }) => `Role '${result.attributes.name}' created successfully with ID: ${result.id}`,
  clientAction: async (client, args) => {
    const {
      name,
      can_edit_schema,
      can_edit_others_content,
      can_publish_content,
      can_edit_favicon,
      can_access_environments,
      can_perform_site_search,
      can_edit_site_entity
    } = args;

    // Prepare role payload from params, filtering out undefined values
    const rolePayload = {
      name,
      ...(can_edit_schema !== undefined && { can_edit_schema }),
      ...(can_edit_others_content !== undefined && { can_edit_others_content }),
      ...(can_publish_content !== undefined && { can_publish_content }),
      ...(can_edit_favicon !== undefined && { can_edit_favicon }),
      ...(can_access_environments !== undefined && { can_access_environments }),
      ...(can_perform_site_search !== undefined && { can_perform_site_search }),
      ...(can_edit_site_entity !== undefined && { can_edit_site_entity }),
    };

    // Create the role using standard client
    return await client.roles.create(rolePayload);
  }
});