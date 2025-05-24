/**
 * @file LocalesRouterTool.ts
 * @description Router tool for Locales operations
 */

import { z } from 'zod';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { localeSchemas } from './schemas.js';
import { createLocaleHandler } from './Create/index.js';
import { listLocalesHandler, getLocaleHandler } from './Read/index.js';
import { updateLocaleHandler } from './Update/index.js';
import { deleteLocaleHandler } from './Delete/index.js';

/**
 * Combined schema for all locale operations
 */
const localesToolSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("create"), ...localeSchemas.create.shape }),
  z.object({ operation: z.literal("list"), ...localeSchemas.list.shape }),
  z.object({ operation: z.literal("get"), ...localeSchemas.get.shape }),
  z.object({ operation: z.literal("update"), ...localeSchemas.update.shape }),
  z.object({ operation: z.literal("delete"), ...localeSchemas.delete.shape }),
]);

export type LocalesToolArgs = z.infer<typeof localesToolSchema>;

/**
 * Router for Locales operations
 * Manages multilingual content settings in DatoCMS
 */
export class LocalesRouterTool {
  name = "datocms_locales";
  description = `Manage locales (languages) in DatoCMS projects.

Available operations:
- create: Add a new locale to the project
- list: Get all locales in the project
- get: Retrieve details of a specific locale
- update: Modify locale settings
- delete: Remove a locale (with restrictions)

Locales define the languages available for content in your DatoCMS project.`;

  inputSchema = localesToolSchema;

  /**
   * Route the request to the appropriate handler based on the operation
   */
  async execute(args: LocalesToolArgs): Promise<any> {
    const { operation, apiToken, environment, ...params } = args;

    // Ensure we have base params for all operations
    const baseParams = { apiToken, environment };

    switch (operation) {
      case "create":
        return createLocaleHandler({ ...baseParams, ...params });

      case "list":
        return listLocalesHandler(baseParams);

      case "get":
        return getLocaleHandler({ ...baseParams, ...params });

      case "update":
        return updateLocaleHandler({ ...baseParams, ...params });

      case "delete":
        return deleteLocaleHandler({ ...baseParams, ...params });

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
}

/**
 * Registers the Locales router tool with the MCP server
 */
export const registerLocalesRouter = (server: McpServer) => {
  const actionEnum = z.enum(["create", "list", "get", "update", "delete"] as const);
  
  server.tool(
    "datocms_locales",
    {
      action: actionEnum,
      args: z.record(z.any()).optional().describe("Arguments for the locale operation")
    },
    {
      title: "DatoCMS Locales",
      description: "Manage locales (languages) in DatoCMS projects"
    },
    async (args) => {
      const tool = new LocalesRouterTool();
      return await tool.execute({ operation: args.action, ...args.args } as LocalesToolArgs);
    }
  );
};