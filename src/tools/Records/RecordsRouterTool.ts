import { z } from "zod";
import { createErrorResponse } from "../../utils/errorHandlers.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SchemaRegistry } from "../../utils/schemaRegistry.js";

// Import type definitions


// Import the record action schemas and handlers
import { recordsSchemas, recordActionsList } from "./schemas.js";

// Import handlers
import { getRecordByIdHandler } from "./Read/handlers/getRecordByIdHandler.js";
import { getRecordReferencesHandler } from "./Read/handlers/getRecordReferencesHandler.js";
import { queryRecordsHandler } from "./Read/handlers/queryRecordsHandler.js";
import { buildRecordEditorUrlFromTypeHandler } from "./Read/handlers/buildRecordEditorUrlFromTypeHandler.js";
import { duplicateRecordHandler, createRecordHandler } from "./Create/handlers/index.js";
import { updateRecordHandler } from "./Update/handlers/index.js";
import { 
  publishRecordHandler,
  unpublishRecordHandler,
  bulkPublishRecordsHandler,
  bulkUnpublishRecordsHandler
} from "./Publication/handlers/index.js";
import { 
  listRecordVersionsHandler,
  getRecordVersionHandler,
  restoreRecordVersionHandler 
} from "./Versions/handlers/index.js";
import { 
  schedulePublicationHandler,
  cancelScheduledPublicationHandler,
  scheduleUnpublicationHandler,
  cancelScheduledUnpublicationHandler
} from "./PublicationScheduling/handlers/index.js";
import {
  destroyRecordHandler,
  bulkDestroyRecordsHandler
} from "./Delete/handlers/index.js";

// Define the types for our action arguments
type ActionArgsMap = {
  query: z.infer<typeof recordsSchemas.query>;
  get: z.infer<typeof recordsSchemas.get>;
  references: z.infer<typeof recordsSchemas.references>;
  record_url: z.infer<typeof recordsSchemas.record_url>;
  create: z.infer<typeof recordsSchemas.create>;
  update: z.infer<typeof recordsSchemas.update>;
  duplicate: z.infer<typeof recordsSchemas.duplicate>;
  destroy: z.infer<typeof recordsSchemas.destroy>;
  bulk_destroy: z.infer<typeof recordsSchemas.bulk_destroy>;
  publish: z.infer<typeof recordsSchemas.publish>;
  bulk_publish: z.infer<typeof recordsSchemas.bulk_publish>;
  unpublish: z.infer<typeof recordsSchemas.unpublish>;
  bulk_unpublish: z.infer<typeof recordsSchemas.bulk_unpublish>;
  schedule_publication: z.infer<typeof recordsSchemas.schedule_publication>;
  cancel_scheduled_publication: z.infer<typeof recordsSchemas.cancel_scheduled_publication>;
  schedule_unpublication: z.infer<typeof recordsSchemas.schedule_unpublication>;
  cancel_scheduled_unpublication: z.infer<typeof recordsSchemas.cancel_scheduled_unpublication>;
  versions_list: z.infer<typeof recordsSchemas.versions_list>;
  version_get: z.infer<typeof recordsSchemas.version_get>;
  version_restore: z.infer<typeof recordsSchemas.version_restore>;
};

// Type for the action parameter
type RecordAction = keyof typeof recordsSchemas;

/**
 * Registers all schemas with the global registry
 */
function registerRecordSchemas() {
  SchemaRegistry.registerBulk("records", recordsSchemas);
}

/**
 * Registers the Records Router tool with the MCP server
 */
export const registerRecordsRouter = (server: McpServer) => {
  registerRecordSchemas();
  const actionEnum = z.enum(recordActionsList as [string, ...string[]]);
  
  // Define the parameter schema using raw properties for compatibility with server.tool
  // This avoids the type error with the server.tool method
  server.tool(
    "datocms_records",
    {
      action: actionEnum,
      args: z.record(z.any()).optional().describe("Arguments for the action to perform. You MUST call datocms_parameters first to know what arguments are required for this action.")
    },
    {
      title: "DatoCMS Records",
      description: "Manage DatoCMS records - items (records) that are instances of item types (models)."
    },
    async (args) => {
      const { action, args: actionArgs = {} } = args;

      try {
        // ALWAYS CHECK FOR PARAMETERS FIRST
        const shouldSuggestParams = (
          Object.keys(actionArgs).length === 0 ||
          (action === 'bulk_destroy' && (!actionArgs.apiToken || !actionArgs.itemIds || !Array.isArray(actionArgs.itemIds))) ||
          (Object.keys(actionArgs).length < 3 && ['query', 'create', 'update', 'bulk_publish'].includes(action))
        );

        if (shouldSuggestParams) {
          return createErrorResponse(`⚠️ PARAMETERS REQUIRED: You need to specify the parameters for the '${action}' action. ⚠️\n\nTo get the required parameters, use the datocms_parameters tool first with:\n{\n  "resource": "records",\n  "action": "${action}"\n}\n\nThis will show you all the required parameters and their types.`);
        }

        const validAction = action as RecordAction;
        const actionSchema = recordsSchemas[validAction];
        if (!actionSchema) {
          return createErrorResponse(`Error: Unsupported action '${action}'. Valid actions are: ${recordActionsList.join(', ')}`);
        }

        try {
          let handlerResult: any;
          
          switch (validAction) {
            case "query":
              try {
                // Validate args using schema
                const validatedArgs = recordsSchemas.query.parse(actionArgs);
                handlerResult = await queryRecordsHandler(validatedArgs);
                break;
              } catch (error) {
                return createErrorResponse(`Error in records.list.query: ${error}`);
              }
            case "get":
              try {
                // Validate args using schema and fix id parameter mismatch
                const validatedArgs = recordsSchemas.get.parse({
                  ...actionArgs,
                  // Map 'id' to 'itemId' if present
                  itemId: actionArgs.id || actionArgs.itemId
                });
                handlerResult = await getRecordByIdHandler(validatedArgs);
                break;
              } catch (error) {
                return createErrorResponse(`Error in records.get: ${error}`);
              }
            case "references":
              handlerResult = await getRecordReferencesHandler(actionArgs as ActionArgsMap['references']);
              break;
            case "record_url":
              handlerResult = await buildRecordEditorUrlFromTypeHandler(actionArgs as ActionArgsMap['record_url']);
              break;
            case "create":
              handlerResult = await createRecordHandler(actionArgs as ActionArgsMap['create']);
              break;
            case "update":
              handlerResult = await updateRecordHandler(actionArgs as ActionArgsMap['update']);
              break;
            case "duplicate":
              handlerResult = await duplicateRecordHandler(actionArgs as ActionArgsMap['duplicate']);
              break;
            case "destroy":
              handlerResult = await destroyRecordHandler(actionArgs as ActionArgsMap['destroy']);
              break;
            case "bulk_destroy":
              handlerResult = await bulkDestroyRecordsHandler(actionArgs as ActionArgsMap['bulk_destroy']);
              break;
            case "publish":
              handlerResult = await publishRecordHandler(actionArgs as ActionArgsMap['publish']);
              break;
            case "bulk_publish":
              handlerResult = await bulkPublishRecordsHandler(actionArgs as ActionArgsMap['bulk_publish']);
              break;
            case "unpublish":
              handlerResult = await unpublishRecordHandler(actionArgs as ActionArgsMap['unpublish']);
              break;
            case "bulk_unpublish":
              handlerResult = await bulkUnpublishRecordsHandler(actionArgs as ActionArgsMap['bulk_unpublish']);
              break;
            case "schedule_publication":
              handlerResult = await schedulePublicationHandler(actionArgs as ActionArgsMap['schedule_publication']);
              break;
            case "cancel_scheduled_publication":
              handlerResult = await cancelScheduledPublicationHandler(actionArgs as ActionArgsMap['cancel_scheduled_publication']);
              break;
            case "schedule_unpublication":
              handlerResult = await scheduleUnpublicationHandler(actionArgs as ActionArgsMap['schedule_unpublication']);
              break;
            case "cancel_scheduled_unpublication":
              handlerResult = await cancelScheduledUnpublicationHandler(actionArgs as ActionArgsMap['cancel_scheduled_unpublication']);
              break;
            case "versions_list":
              handlerResult = await listRecordVersionsHandler(actionArgs as ActionArgsMap['versions_list']);
              break;
            case "version_get":
              handlerResult = await getRecordVersionHandler(actionArgs as ActionArgsMap['version_get']);
              break;
            case "version_restore":
              handlerResult = await restoreRecordVersionHandler(actionArgs as ActionArgsMap['version_restore']);
              break;
            default: {
              const _exhaustiveCheck: never = validAction;
              throw new Error(`Unsupported action: ${_exhaustiveCheck}`);
            }
          }
          
          // Check if we have a result from the switch statement
          if (!handlerResult) {
            // For cases that still use return, we won't reach here
            return createErrorResponse(`No result from handler for action '${action}'`);
          }
          
          // Process the handler result
          if (handlerResult && typeof handlerResult === 'object') {
            if ('content' in handlerResult) {
              // Already a proper MCP response
              return handlerResult;
            }
          }
          
          // If we got here, something unexpected happened
          return handlerResult;
        } catch (error) {
          return createErrorResponse(`Error processing '${action}' action: ${error instanceof Error ? error.message : String(error)}`);
        }
      } catch (error: unknown) {
        return createErrorResponse(`Error in Records Router: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  );
};

// Only destructor method needs to remain
/**
 * Helper function to clean up and release resources when the MCP server is shut down
 */
export function destroy() {
  // Clean up code here if needed
}

