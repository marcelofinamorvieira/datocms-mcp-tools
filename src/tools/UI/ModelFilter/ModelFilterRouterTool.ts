import { McpServer } from "@modelcontextprotocol/sdk";
import { z } from "zod";
import { modelFilterSchemas, modelFilterSchemaKeys } from "./schemas.js";
import { createModelFilterHandler } from "./Create/handlers/index.js";
import { listModelFiltersHandler } from "./Read/handlers/index.js";
import { retrieveModelFilterHandler } from "./Read/handlers/index.js";
import { updateModelFilterHandler } from "./Update/handlers/index.js";
import { deleteModelFilterHandler } from "./Delete/handlers/index.js";
import { formatErrorResponse, formatZodError } from "../../../utils/errorHandlers.js";
import { createResponse } from "../../../utils/responseHandlers.js";
import { ZodError } from "zod";

// Create action enum from model filter schema keys
const actionEnum = z.enum(modelFilterSchemaKeys);
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
    async ({ action, args = {} }) => {
      try {
        // Get schema for the requested action
        const schema = modelFilterSchemas[action];

        // Validate the arguments against the schema
        try {
          schema.parse(args);
        } catch (e) {
          if (e instanceof ZodError) {
            // Handle validation errors with helpful messages
            return formatZodError(
              action,
              schema,
              e,
              { 
                title: `Model Filter ${action}`, 
                description: `Interact with model filters - ${action} operation`
              }
            );
          }
          throw e;
        }

        // Route to the appropriate handler based on the action
        switch (action) {
          case "list":
            return await listModelFiltersHandler(args);
          case "retrieve":
            return await retrieveModelFilterHandler(args);
          case "create":
            return await createModelFilterHandler(args);
          case "update":
            return await updateModelFilterHandler(args);
          case "delete":
            return await deleteModelFilterHandler(args);
          default:
            return createResponse(
              "error",
              `Invalid action: ${action}. Valid actions are: ${modelFilterSchemaKeys.join(", ")}`
            );
        }
      } catch (error) {
        return formatErrorResponse(error);
      }
    }
  );
};

/**
 * Destroy the ModelFilter router (remove it from the server)
 */
export const destroyModelFilterRouter = (server: McpServer) => {
  server.removeTool("datocms_ui_model_filter");
};