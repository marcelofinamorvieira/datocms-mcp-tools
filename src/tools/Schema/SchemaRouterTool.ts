import { z } from "zod";
import { getClient } from "../../utils/clientManager.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../utils/errorHandlers.js";
import { createResponse } from "../../utils/responseHandlers.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Import the schema action schemas and handlers
import { schemaSchemas, schemaActionsList } from "./schemas.js";

// Import ItemType handlers
import {
  createItemTypeHandler,
  duplicateItemTypeHandler
} from "./ItemType/Create/handlers/index.js";
import {
  getItemTypeHandler,
  listItemTypesHandler
} from "./ItemType/Read/handlers/index.js";
import {
  updateItemTypeHandler
} from "./ItemType/Update/handlers/index.js";
import {
  deleteItemTypeHandler
} from "./ItemType/Delete/handlers/index.js";

// Import Fieldset handlers
import {
  createFieldsetHandler
} from "./Fieldset/Create/handlers/index.js";
import {
  getFieldsetHandler,
  listFieldsetsHandler
} from "./Fieldset/Read/handlers/index.js";
import {
  updateFieldsetHandler
} from "./Fieldset/Update/handlers/index.js";
import {
  destroyFieldsetHandler
} from "./Fieldset/Delete/handlers/index.js";

// Import Field handlers
import {
  createFieldHandler
} from "./Field/Create/handlers/index.js";
import {
  getFieldHandler,
  listFieldsHandler
} from "./Field/Read/handlers/index.js";
import {
  updateFieldHandler
} from "./Field/Update/handlers/index.js";
import {
  deleteFieldHandler
} from "./Field/Delete/handlers/index.js";

// Define the types for our action arguments
type ActionArgsMap = {
  // ItemType actions
  create_item_type: z.infer<typeof schemaSchemas.create_item_type>;
  duplicate_item_type: z.infer<typeof schemaSchemas.duplicate_item_type>;
  get_item_type: z.infer<typeof schemaSchemas.get_item_type>;
  list_item_types: z.infer<typeof schemaSchemas.list_item_types>;
  update_item_type: z.infer<typeof schemaSchemas.update_item_type>;
  delete_item_type: z.infer<typeof schemaSchemas.delete_item_type>;

  // Fieldset actions
  create_fieldset: z.infer<typeof schemaSchemas.create_fieldset>;
  get_fieldset: z.infer<typeof schemaSchemas.get_fieldset>;
  list_fieldsets: z.infer<typeof schemaSchemas.list_fieldsets>;
  update_fieldset: z.infer<typeof schemaSchemas.update_fieldset>;
  delete_fieldset: z.infer<typeof schemaSchemas.delete_fieldset>;

  // Field actions
  create_field: z.infer<typeof schemaSchemas.create_field>;
  get_field: z.infer<typeof schemaSchemas.get_field>;
  list_fields: z.infer<typeof schemaSchemas.list_fields>;
  update_field: z.infer<typeof schemaSchemas.update_field>;
  delete_field: z.infer<typeof schemaSchemas.delete_field>;
};

// Type for the action parameter
type SchemaAction = keyof typeof schemaSchemas;

/**
 * Registers the Schema Router tool with the MCP server
 */
export const registerSchemaRouter = (server: McpServer) => {
  const actionEnum = z.enum(schemaActionsList as [string, ...string[]]);

  server.tool(
    // Tool name
    "datocms_schema",
    // Parameter schema with types using discriminated union based on action
    {
      action: actionEnum,
      args: z.record(z.any()).optional().describe("Arguments for the action to perform. You MUST call datocms_parameters first to know what arguments are required for this action."),
    },
    // Annotations for the tool
    {
      title: "DatoCMS Schema",
      description: "Manage DatoCMS schema components - item types (models), fieldsets, fields, field types, and blocks for defining your content structure."
    },
    // Handler function for the schema router
    async ({ action, args = {} }) => {
      try {
        // ALWAYS CHECK FOR PARAMETERS FIRST
        // If there are no arguments, or very few args for non-trivial operations,
        // redirect users to get_parameters first
        const shouldSuggestParams = (
          // These conditions indicate the user is likely not providing proper parameters
          Object.keys(args).length === 0
        );

        if (shouldSuggestParams) {
          return createErrorResponse(`⚠️ PARAMETERS REQUIRED: You need to specify the parameters for the '${action}' action. ⚠️

To get the required parameters, use the datocms_parameters tool first with:
{
  "resource": "schema",
  "action": "${action}"
}

This will show you all the required parameters and their types.`);
        }

        // Get the schema for the action
        const validAction = action as SchemaAction;
        const actionSchema = schemaSchemas[validAction];
        if (!actionSchema) {
          return createErrorResponse(`Error: Unsupported action '${action}'. Valid actions are: ${schemaActionsList.join(', ')}`);
        }

        // Validate arguments against the schema
        try {
          const validatedArgs = actionSchema.parse(args);

          // Route to the appropriate handler based on the action
          let handlerResult: any;
          
          switch (validAction) {
            // ItemType handlers
            case "create_item_type":
              handlerResult = await createItemTypeHandler(validatedArgs as ActionArgsMap['create_item_type']);
              break;
            case "duplicate_item_type":
              handlerResult = await duplicateItemTypeHandler(validatedArgs as ActionArgsMap['duplicate_item_type']);
              break;
            case "get_item_type":
              handlerResult = await getItemTypeHandler(validatedArgs as ActionArgsMap['get_item_type']);
              break;
            case "list_item_types":
              handlerResult = await listItemTypesHandler(validatedArgs as ActionArgsMap['list_item_types']);
              break;
            case "update_item_type":
              handlerResult = await updateItemTypeHandler(validatedArgs as ActionArgsMap['update_item_type']);
              break;
            case "delete_item_type":
              handlerResult = await deleteItemTypeHandler(validatedArgs as ActionArgsMap['delete_item_type']);
              break;

            // Fieldset handlers
            case "create_fieldset":
              handlerResult = await createFieldsetHandler(validatedArgs as ActionArgsMap['create_fieldset']);
              break;
            case "get_fieldset":
              handlerResult = await getFieldsetHandler(validatedArgs as ActionArgsMap['get_fieldset']);
              break;
            case "list_fieldsets":
              handlerResult = await listFieldsetsHandler(validatedArgs as ActionArgsMap['list_fieldsets']);
              break;
            case "update_fieldset":
              handlerResult = await updateFieldsetHandler(validatedArgs as ActionArgsMap['update_fieldset']);
              break;
            case "delete_fieldset":
              handlerResult = await destroyFieldsetHandler(validatedArgs as ActionArgsMap['delete_fieldset']);
              break;

            // Field handlers
            case "create_field":
              handlerResult = await createFieldHandler(validatedArgs as ActionArgsMap['create_field']);
              break;
            case "get_field":
              handlerResult = await getFieldHandler(validatedArgs as ActionArgsMap['get_field']);
              break;
            case "list_fields":
              handlerResult = await listFieldsHandler(validatedArgs as ActionArgsMap['list_fields']);
              break;
            case "update_field":
              handlerResult = await updateFieldHandler(validatedArgs as ActionArgsMap['update_field']);
              break;
            case "delete_field":
              handlerResult = await deleteFieldHandler(validatedArgs as ActionArgsMap['delete_field']);
              break;

            default: {
              // This is a type check to ensure we've handled all possible actions
              const _exhaustiveCheck: never = validAction;
              return createErrorResponse(`Error: Unsupported action '${action}'. This is likely a bug.`);
            }
          }
          
          // Handle the new typed responses
          if (handlerResult && typeof handlerResult === 'object') {
            // Check if it's already a Response object from createResponse/createErrorResponse
            if ('content' in handlerResult) {
              return handlerResult;
            }
            
            // For our new typed responses
            if ('success' in handlerResult) {
              if (handlerResult.success) {
                // Success response
                const responseContent = JSON.stringify(handlerResult.data || {}, null, 2);
                let response = responseContent;
                
                // Add message if present
                if (handlerResult.message) {
                  response = `${responseContent}\n\n${handlerResult.message}`;
                }
                
                // Add pagination info if present
                if (handlerResult.pagination) {
                  const paginationInfo = `\n\nPagination: Page ${handlerResult.pagination.currentPage} of ${handlerResult.pagination.totalPages} (Total items: ${handlerResult.totalCount})`;
                  response = `${response}${paginationInfo}`;
                }
                
                return createResponse(response);
              } else {
                // Error response
                return createErrorResponse(handlerResult.error || 'Unknown error occurred');
              }
            }
          }
          
          // Fallback for unhandled response types
          return createResponse(JSON.stringify(handlerResult, null, 2));
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

To see proper documentation, use the 'datocms_parameters' tool first with:\n\n  action: "datocms_parameters",\n  args: {\n    resource: "schema",\n    action: "${action}"\n  }`);
          }
          return createErrorResponse(`Error validating arguments: ${extractDetailedErrorInfo(error)}`);
        }
      } catch (error: unknown) {
        return createErrorResponse(`Error in Schema Router: ${extractDetailedErrorInfo(error)}`);
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