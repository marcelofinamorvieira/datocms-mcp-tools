import { z } from "zod";
import { buildClient } from "@datocms/cma-client-node";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../utils/errorHandlers.js";
import { createResponse } from "../../../utils/responseHandlers.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Import the schema menu item action schemas and handlers
import { schemaMenuItemSchemas, schemaMenuItemActionsList } from "./schemas.js";

// Import handlers (to be implemented)
import { listSchemaMenuItemsHandler } from "./Read/handlers/index.js";
import { retrieveSchemaMenuItemHandler } from "./Read/handlers/index.js";
import { createSchemaMenuItemHandler } from "./Create/handlers/index.js";
import { updateSchemaMenuItemHandler } from "./Update/handlers/index.js";
import { deleteSchemaMenuItemHandler } from "./Delete/handlers/index.js";

// Define the types for our action arguments
type ActionArgsMap = {
  list: z.infer<typeof schemaMenuItemSchemas.list>;
  retrieve: z.infer<typeof schemaMenuItemSchemas.retrieve>;
  create: z.infer<typeof schemaMenuItemSchemas.create>;
  update: z.infer<typeof schemaMenuItemSchemas.update>;
  delete: z.infer<typeof schemaMenuItemSchemas.delete>;
};

// Type for the action parameter
type SchemaMenuItemAction = keyof typeof schemaMenuItemSchemas;

/**
 * Registers the SchemaMenuItem Router tool with the MCP server
 */
export const registerSchemaMenuItemRouter = (server: McpServer) => {
  const actionEnum = z.enum(schemaMenuItemActionsList as [string, ...string[]]);
  
  server.tool(
    // Tool name
    "datocms_ui_schema_menu_item",
    // Parameter schema with types using discriminated union based on action
    {
      action: actionEnum,
      args: z.record(z.any()).optional().describe("Arguments for the action to perform. You MUST call datocms_parameters first to know what arguments are required for this action."),
    },
    // Annotations for the tool
    {
      title: "DatoCMS Schema Menu Item",
      description: "Interact with DatoCMS schema menu items - list, retrieve, create, update, and delete schema menu items in the UI."
    },
    // Handler function for the schema menu items router
    async ({ action, args = {} }) => {
      try {
        // ALWAYS CHECK FOR PARAMETERS FIRST
        // If there are no arguments, or very few args for non-trivial operations,
        // redirect users to get_parameters first
        const shouldSuggestParams = (
          // These conditions indicate the user is likely not providing proper parameters
          Object.keys(args).length === 0 || 
          (Object.keys(args).length < 3 && ['create', 'update'].includes(action))
        );
        
        if (shouldSuggestParams) {
          return createErrorResponse(`⚠ PARAMETERS REQUIRED: You need to specify the parameters for the '${action}' action. ⚠

To get the required parameters, use the datocms_parameters tool first with:
{
  "resource": "ui_schema_menu_item",
  "action": "${action}"
}

This will show you all the required parameters and their types.`);
        }
        
        // Get the schema for the action
        const validAction = action as SchemaMenuItemAction;
        const actionSchema = schemaMenuItemSchemas[validAction];
        if (!actionSchema) {
          return createErrorResponse(`Error: Unsupported action '${action}'. Valid actions are: ${schemaMenuItemActionsList.join(', ')}`);
        }
        
        // Validate arguments against the schema
        try {
          const validatedArgs = actionSchema.parse(args);
          
          // Route to the appropriate handler based on the action
          switch (validAction) {
            case "list":
              return listSchemaMenuItemsHandler(validatedArgs as ActionArgsMap['list']);
            case "retrieve":
              return retrieveSchemaMenuItemHandler(validatedArgs as ActionArgsMap['retrieve']);
            case "create":
              return createSchemaMenuItemHandler(validatedArgs as ActionArgsMap['create']);
            case "update":
              return updateSchemaMenuItemHandler(validatedArgs as ActionArgsMap['update']);
            case "delete":
              return deleteSchemaMenuItemHandler(validatedArgs as ActionArgsMap['delete']);
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
            
            return createErrorResponse(`⚠ VALIDATION ERROR: Your parameters for '${action}' are incorrect or incomplete! ⚠

${errorFormatted}

REQUIRED PARAMETERS FOR '${action.toUpperCase()}' ACTION:
${JSON.stringify(schemaInfo, null, 2)}

To see proper documentation, use the 'datocms_parameters' tool first with:\n\n  action: "datocms_parameters",\n  args: {\n    resource: "ui_schema_menu_item",\n    action: "${action}"\n  }`);
          }
          return createErrorResponse(`Error validating arguments: ${extractDetailedErrorInfo(error)}`);
        }
      } catch (error: unknown) {
        return createErrorResponse(`Error in Schema Menu Item Router: ${extractDetailedErrorInfo(error)}`);
      }
    }
  );
};

/**
 * Helper function to clean up and release resources when the MCP server is shut down
 */
export function destroySchemaMenuItemRouter() {
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