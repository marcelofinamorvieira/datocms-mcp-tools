import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { modelFilterSchemas, modelFilterSchemaKeys } from "./schemas.js";
import { createModelFilterHandler } from "./Create/handlers/index.js";
import { listModelFiltersHandler } from "./Read/handlers/index.js";
import { retrieveModelFilterHandler } from "./Read/handlers/index.js";
import { updateModelFilterHandler } from "./Update/handlers/index.js";
import { deleteModelFilterHandler } from "./Delete/handlers/index.js";
import { createErrorResponse } from "../../../utils/errorHandlers.js";
import { createResponse } from "../../../utils/responseHandlers.js";
import { ZodError } from "zod";

// Create action enum from model filter schema keys
const actionEnum = z.enum(modelFilterSchemaKeys as [string, ...string[]]);
type Action = z.infer<typeof actionEnum>;

/**
 * Register the ModelFilter router with the MCP server
 */
export const registerModelFilterRouter = (server: McpServer) => {
  server.tool(
    "datocms_ui_model_filter",
    {
      action: actionEnum,
      args: z.record(z.any()).optional()
    },
    { title: "DatoCMS Model Filter", description: "Interact with DatoCMS model filters" },
    async ({ action, args = {} }: { action: Action, args?: Record<string, any> }) => {
      try {
        // Get schema for the requested action
        const schema = modelFilterSchemas[action as keyof typeof modelFilterSchemas];

        // Validate the arguments against the schema
        try {
          schema.parse(args);
        } catch (e) {
          if (e instanceof ZodError) {
            // Handle validation errors with helpful messages
            return createErrorResponse(
              `Validation error for model filter ${action}: ${e.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')}`
            );
          }
          throw e;
        }

        // Route to the appropriate handler based on the action
        switch (action) {
          case "list":
            return await listModelFiltersHandler(args as z.infer<typeof modelFilterSchemas.list>);
          case "retrieve":
            return await retrieveModelFilterHandler(args as z.infer<typeof modelFilterSchemas.retrieve>);
          case "create":
            return await createModelFilterHandler(args as z.infer<typeof modelFilterSchemas.create>);
          case "update":
            return await updateModelFilterHandler(args as z.infer<typeof modelFilterSchemas.update>);
          case "delete":
            return await deleteModelFilterHandler(args as z.infer<typeof modelFilterSchemas.delete>);
          default:
            return createErrorResponse(
              `Invalid action: ${action}. Valid actions are: ${modelFilterSchemaKeys.join(", ")}`
            );
        }
      } catch (error) {
        return createErrorResponse(`Error in ModelFilter Router: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );
};

/**
 * Destroy the ModelFilter router (remove it from the server)
 */
export const destroyModelFilterRouter = (_server: McpServer) => {
  // Cleanup functionality if needed
};