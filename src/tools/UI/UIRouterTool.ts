import { z } from "zod";
import { getClient } from "../../utils/clientManager.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../utils/errorHandlers.js";
import { createResponse } from "../../utils/responseHandlers.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Import the UI action schemas and handlers
import { uiSchemas, uiActionsList } from "./schemas.js";

// Import MenuItem handlers
import {
  listMenuItemsHandler,
  retrieveMenuItemHandler
} from "./MenuItem/Read/handlers/index.js";
import {
  createMenuItemHandler
} from "./MenuItem/Create/handlers/index.js";
import {
  updateMenuItemHandler
} from "./MenuItem/Update/handlers/index.js";
import {
  deleteMenuItemHandler
} from "./MenuItem/Delete/handlers/index.js";

// Import SchemaMenuItem handlers
import {
  listSchemaMenuItemsHandler,
  retrieveSchemaMenuItemHandler
} from "./SchemaMenuItem/Read/handlers/index.js";
import {
  createSchemaMenuItemHandler
} from "./SchemaMenuItem/Create/handlers/index.js";
import {
  updateSchemaMenuItemHandler
} from "./SchemaMenuItem/Update/handlers/index.js";
import {
  deleteSchemaMenuItemHandler
} from "./SchemaMenuItem/Delete/handlers/index.js";

// Import UploadsFilter handlers
import {
  listUploadsFiltersHandler,
  retrieveUploadsFilterHandler
} from "./UploadsFilter/Read/handlers/index.js";
import {
  createUploadsFilterHandler
} from "./UploadsFilter/Create/handlers/index.js";
import {
  updateUploadsFilterHandler
} from "./UploadsFilter/Update/handlers/index.js";
import {
  deleteUploadsFilterHandler
} from "./UploadsFilter/Delete/handlers/index.js";

// Import ModelFilter handlers
import {
  listModelFiltersHandler,
  retrieveModelFilterHandler
} from "./ModelFilter/Read/handlers/index.js";
import {
  createModelFilterHandler
} from "./ModelFilter/Create/handlers/index.js";
import {
  updateModelFilterHandler
} from "./ModelFilter/Update/handlers/index.js";
import {
  deleteModelFilterHandler
} from "./ModelFilter/Delete/handlers/index.js";

// Import Plugins handlers
import {
  listPluginsHandler,
  retrievePluginHandler
} from "./Plugins/Read/handlers/index.js";
import {
  createPluginHandler
} from "./Plugins/Create/handlers/index.js";
import {
  updatePluginHandler
} from "./Plugins/Update/handlers/index.js";
import {
  deletePluginHandler
} from "./Plugins/Delete/handlers/index.js";

// Define the types for our action arguments
type ActionArgsMap = {
  // MenuItem actions
  menu_item_list: z.infer<typeof uiSchemas.menu_item_list>;
  menu_item_retrieve: z.infer<typeof uiSchemas.menu_item_retrieve>;
  menu_item_create: z.infer<typeof uiSchemas.menu_item_create>;
  menu_item_update: z.infer<typeof uiSchemas.menu_item_update>;
  menu_item_delete: z.infer<typeof uiSchemas.menu_item_delete>;

  // SchemaMenuItem actions
  schema_menu_item_list: z.infer<typeof uiSchemas.schema_menu_item_list>;
  schema_menu_item_retrieve: z.infer<typeof uiSchemas.schema_menu_item_retrieve>;
  schema_menu_item_create: z.infer<typeof uiSchemas.schema_menu_item_create>;
  schema_menu_item_update: z.infer<typeof uiSchemas.schema_menu_item_update>;
  schema_menu_item_delete: z.infer<typeof uiSchemas.schema_menu_item_delete>;

  // UploadsFilter actions
  uploads_filter_list: z.infer<typeof uiSchemas.uploads_filter_list>;
  uploads_filter_retrieve: z.infer<typeof uiSchemas.uploads_filter_retrieve>;
  uploads_filter_create: z.infer<typeof uiSchemas.uploads_filter_create>;
  uploads_filter_update: z.infer<typeof uiSchemas.uploads_filter_update>;
  uploads_filter_delete: z.infer<typeof uiSchemas.uploads_filter_delete>;

  // ModelFilter actions
  model_filter_list: z.infer<typeof uiSchemas.model_filter_list>;
  model_filter_retrieve: z.infer<typeof uiSchemas.model_filter_retrieve>;
  model_filter_create: z.infer<typeof uiSchemas.model_filter_create>;
  model_filter_update: z.infer<typeof uiSchemas.model_filter_update>;
  model_filter_delete: z.infer<typeof uiSchemas.model_filter_delete>;

  // Plugins actions
  plugin_list: z.infer<typeof uiSchemas.plugin_list>;
  plugin_retrieve: z.infer<typeof uiSchemas.plugin_retrieve>;
  plugin_create: z.infer<typeof uiSchemas.plugin_create>;
  plugin_update: z.infer<typeof uiSchemas.plugin_update>;
  plugin_delete: z.infer<typeof uiSchemas.plugin_delete>;
};

// Type for the action parameter
type UIAction = keyof typeof uiSchemas;

/**
 * Registers the UI Router tool with the MCP server
 */
export const registerUIRouter = (server: McpServer) => {
  const actionEnum = z.enum(uiActionsList as [string, ...string[]]);

  server.tool(
    // Tool name
    "datocms_ui",
    // Parameter schema with types using discriminated union based on action
    {
      action: actionEnum,
      args: z.record(z.any()).optional().describe("Arguments for the action to perform. You MUST call datocms_parameters first to know what arguments are required for this action."),
    },
    // Annotations for the tool
    {
      title: "DatoCMS UI",
      description: "Manage DatoCMS UI components - menu items, schema menu items, uploads filters, model filters, and plugins."
    },
    // Handler function for the UI router
    async ({ action, args = {} }) => {
      try {
        // Check if we should suggest getting parameters first
        const shouldSuggestParams = (
          Object.keys(args).length === 0 || 
          (Object.keys(args).length < 3 && action.includes('create') || action.includes('update'))
        );

        if (shouldSuggestParams) {
          return createErrorResponse(`⚠️ PARAMETERS REQUIRED: You need to specify the parameters for the '${action}' action. ⚠️

To get the required parameters, use the datocms_parameters tool first with:
{
  "resource": "ui",
  "action": "${action}"
}

This will show you all the required parameters and their types.`);
        }

        // Get the schema for the action
        const validAction = action as UIAction;
        const actionSchema = uiSchemas[validAction];
        if (!actionSchema) {
          return createErrorResponse(`Error: Unsupported action '${action}'. Valid actions are: ${uiActionsList.join(', ')}`);
        }

        // Validate arguments against the schema
        try {
          const validatedArgs = actionSchema.parse(args);

          // Route to the appropriate handler based on the action
          switch (validAction) {
            // MenuItem handlers
            case "menu_item_list":
              return listMenuItemsHandler(validatedArgs as ActionArgsMap['menu_item_list']);
            case "menu_item_retrieve":
              return retrieveMenuItemHandler(validatedArgs as ActionArgsMap['menu_item_retrieve']);
            case "menu_item_create":
              return createMenuItemHandler(validatedArgs as ActionArgsMap['menu_item_create']);
            case "menu_item_update":
              return updateMenuItemHandler(validatedArgs as ActionArgsMap['menu_item_update']);
            case "menu_item_delete":
              return deleteMenuItemHandler(validatedArgs as ActionArgsMap['menu_item_delete']);

            // SchemaMenuItem handlers
            case "schema_menu_item_list":
              return listSchemaMenuItemsHandler(validatedArgs as ActionArgsMap['schema_menu_item_list']);
            case "schema_menu_item_retrieve":
              return retrieveSchemaMenuItemHandler(validatedArgs as ActionArgsMap['schema_menu_item_retrieve']);
            case "schema_menu_item_create":
              return createSchemaMenuItemHandler(validatedArgs as ActionArgsMap['schema_menu_item_create']);
            case "schema_menu_item_update":
              return updateSchemaMenuItemHandler(validatedArgs as ActionArgsMap['schema_menu_item_update']);
            case "schema_menu_item_delete":
              return deleteSchemaMenuItemHandler(validatedArgs as ActionArgsMap['schema_menu_item_delete']);

            // UploadsFilter handlers
            case "uploads_filter_list":
              return listUploadsFiltersHandler(validatedArgs as ActionArgsMap['uploads_filter_list']);
            case "uploads_filter_retrieve":
              return retrieveUploadsFilterHandler(validatedArgs as ActionArgsMap['uploads_filter_retrieve']);
            case "uploads_filter_create":
              return createUploadsFilterHandler(validatedArgs as ActionArgsMap['uploads_filter_create']);
            case "uploads_filter_update":
              return updateUploadsFilterHandler(validatedArgs as ActionArgsMap['uploads_filter_update']);
            case "uploads_filter_delete":
              return deleteUploadsFilterHandler(validatedArgs as ActionArgsMap['uploads_filter_delete']);

            // ModelFilter handlers
            case "model_filter_list":
              return listModelFiltersHandler(validatedArgs as ActionArgsMap['model_filter_list']);
            case "model_filter_retrieve":
              return retrieveModelFilterHandler(validatedArgs as ActionArgsMap['model_filter_retrieve']);
            case "model_filter_create":
              return createModelFilterHandler(validatedArgs as ActionArgsMap['model_filter_create']);
            case "model_filter_update":
              return updateModelFilterHandler(validatedArgs as ActionArgsMap['model_filter_update']);
            case "model_filter_delete":
              return deleteModelFilterHandler(validatedArgs as ActionArgsMap['model_filter_delete']);

            // Plugins handlers
            case "plugin_list":
              return listPluginsHandler(validatedArgs as ActionArgsMap['plugin_list']);
            case "plugin_retrieve":
              return retrievePluginHandler(validatedArgs as ActionArgsMap['plugin_retrieve']);
            case "plugin_create":
              return createPluginHandler(validatedArgs as ActionArgsMap['plugin_create']);
            case "plugin_update":
              return updatePluginHandler(validatedArgs as ActionArgsMap['plugin_update']);
            case "plugin_delete":
              return deletePluginHandler(validatedArgs as ActionArgsMap['plugin_delete']);

            default: {
              // This is a type check to ensure we've handled all possible actions
              const _exhaustiveCheck: never = validAction;
              return createErrorResponse(`Error: Unsupported action '${action}'. This is likely a bug.`);
            }
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            // Get the schema for documentation purposes
            const schemaInfo = formatSchemaForDisplay(actionSchema);

            // Format the validation error in a helpful way
            const errorFormatted = formatZodError(error);

            return createErrorResponse(`⚠️ VALIDATION ERROR: Your parameters for '${action}' are incorrect or incomplete! ⚠️

${errorFormatted}

REQUIRED PARAMETERS FOR '${action.toUpperCase()}' ACTION:
${JSON.stringify(schemaInfo, null, 2)}

To see proper documentation, use the 'datocms_parameters' tool first with:\n\n  action: "datocms_parameters",\n  args: {\n    resource: "ui",\n    action: "${action}"\n  }`);
          }
          return createErrorResponse(`Error validating arguments: ${extractDetailedErrorInfo(error)}`);
        }
      } catch (error: unknown) {
        return createErrorResponse(`Error in UI Router: ${extractDetailedErrorInfo(error)}`);
      }
    }
  );
};

/**
 * Helper function to clean up and release resources when the MCP server is shut down
 */
export function destroy() {
  // Clean up code here if needed
}

// Helper function to format schema for display
function formatSchemaForDisplay(schema: z.ZodSchema) {
  // Extract structure and metadata from the schema
  const description = schema.description || "No description available";

  // Try to extract basic information about the schema
  try {
    // @ts-expect-error - Zod's type definitions are not consistent across versions
    const schemaDescription = schema.describe();

    // Add a note to use the get_parameters tool
    return {
      ...schemaDescription,
      note: "For more detailed parameter information, use the 'datocms_parameters' tool"
    };
  } catch (error) {
    // Fallback if the schema doesn't support describe()
    return {
      type: "object",
      description,
      note: "Schema details unavailable. Use the 'datocms_parameters' tool for parameter information."
    };
  }
}

// Helper function to format ZodError for display
function formatZodError(error: z.ZodError) {
  return error.issues.map(issue => `- ${issue.path.join('.')}: ${issue.message}`).join('\n');
}