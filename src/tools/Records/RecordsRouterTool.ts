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
import { enhancedQueryRecordsHandler } from "./Read/handlers/enhancedQueryRecordsHandler.js";
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
          switch (validAction) {
            case "query":
              return enhancedQueryRecordsHandler(actionArgs);
            case "get":
              return getRecordByIdHandler(actionArgs as ActionArgsMap['get']);
            case "references":
              return getRecordReferencesHandler(actionArgs as ActionArgsMap['references']);
            case "record_url":
              return buildRecordEditorUrlFromTypeHandler(actionArgs as ActionArgsMap['record_url']);
            case "create":
              return createRecordHandler(actionArgs as ActionArgsMap['create']);
            case "update":
              return updateRecordHandler(actionArgs as ActionArgsMap['update']);
            case "duplicate":
              return duplicateRecordHandler(actionArgs as ActionArgsMap['duplicate']);
            case "destroy":
              return destroyRecordHandler(actionArgs as ActionArgsMap['destroy']);
            case "bulk_destroy":
              return bulkDestroyRecordsHandler(actionArgs as ActionArgsMap['bulk_destroy']);
            case "publish":
              return publishRecordHandler(actionArgs as ActionArgsMap['publish']);
            case "bulk_publish":
              return bulkPublishRecordsHandler(actionArgs as ActionArgsMap['bulk_publish']);
            case "unpublish":
              return unpublishRecordHandler(actionArgs as ActionArgsMap['unpublish']);
            case "bulk_unpublish":
              return bulkUnpublishRecordsHandler(actionArgs as ActionArgsMap['bulk_unpublish']);
            case "schedule_publication":
              return schedulePublicationHandler(actionArgs as ActionArgsMap['schedule_publication']);
            case "cancel_scheduled_publication":
              return cancelScheduledPublicationHandler(actionArgs as ActionArgsMap['cancel_scheduled_publication']);
            case "schedule_unpublication":
              return scheduleUnpublicationHandler(actionArgs as ActionArgsMap['schedule_unpublication']);
            case "cancel_scheduled_unpublication":
              return cancelScheduledUnpublicationHandler(actionArgs as ActionArgsMap['cancel_scheduled_unpublication']);
            case "versions_list":
              return listRecordVersionsHandler(actionArgs as ActionArgsMap['versions_list']);
            case "version_get":
              return getRecordVersionHandler(actionArgs as ActionArgsMap['version_get']);
            case "version_restore":
              return restoreRecordVersionHandler(actionArgs as ActionArgsMap['version_restore']);
            default: {
              const _exhaustiveCheck: never = validAction;
              return createErrorResponse(`Error: Unsupported action '${action}'. This is likely a bug.`);
            }
          }
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

