import { z } from "zod";
import { getClient } from "../../../utils/clientManager.js";
import { isAuthorizationError, extractDetailedErrorInfo } from "../../../utils/errorHandlers.js";
import {
  createStandardSuccessResponse,
  createStandardErrorResponse,
  createStandardMcpResponse
} from "../../../utils/standardResponse.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Registers the ListDatoCMSEnvironments tool with the MCP server
 */
export const registerListDatoCMSEnvironments = (server: McpServer) => {
  server.tool(
    // Tool name
    "ListDatoCMSEnvironments",
    // Parameter schema with types
    { 
      apiToken: z.string().describe("DatoCMS API token for authentication. If you are not certain of one, ask for the user, do not hallucinate.")
    },
    // Annotations for the tool
    {
      title: "List DatoCMS Environments",
      description: "Retrieves a list of all environments in the DatoCMS project.",
      readOnlyHint: true // This tool only reads resources
    },
    // Handler function for listing environments
    async ({ apiToken }) => {
      try {
        // Initialize DatoCMS client
        const client = getClient(apiToken);
        
        try {
          // List all environments
          const environments = await client.environments.list();

          if (!environments || environments.length === 0) {
            const response = createStandardSuccessResponse<any[]>([], "No environments found.");
            return createStandardMcpResponse(response);
          }

          const response = createStandardSuccessResponse(environments as any[], `Found ${environments.length} environment(s).`);
          return createStandardMcpResponse(response);
          
        } catch (apiError: unknown) {
          if (isAuthorizationError(apiError)) {
            const response = createStandardErrorResponse(
              "Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.",
              { error_code: "INVALID_API_TOKEN" }
            );
            return createStandardMcpResponse(response);
          }

          const response = createStandardErrorResponse(apiError);
          return createStandardMcpResponse(response);
        }
      } catch (error: unknown) {
        const response = createStandardErrorResponse(
          `Error listing environments: ${extractDetailedErrorInfo(error)}`
        );
        return createStandardMcpResponse(response);
      }
    }
  );
};

