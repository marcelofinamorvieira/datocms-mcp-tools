import { z } from "zod";
import { getClient } from "../../../utils/clientManager.js";
import { isAuthorizationError, isNotFoundError, extractDetailedErrorInfo } from "../../../utils/errorHandlers.js";
import {
  createStandardSuccessResponse,
  createStandardErrorResponse,
  createStandardMcpResponse
} from "../../../utils/standardResponse.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Registers the DeleteDatoCMSEnvironment tool with the MCP server
 */
export const registerDeleteDatoCMSEnvironment = (server: McpServer) => {
  server.tool(
    // Tool name
    "DeleteDatoCMSEnvironment",
    // Parameter schema with types
    { 
      apiToken: z.string().describe("DatoCMS API token for authentication. If you are not certain of one, ask for the user, do not hallucinate."),
      environmentId: z.string().describe("The ID of the environment to delete."),
      confirmation: z.literal("confirm").describe("Type 'confirm' to confirm the deletion. This is required to prevent accidental deletion.")
    },
    // Annotations for the tool
    {
      title: "Delete DatoCMS Environment",
      description: "Permanently deletes a DatoCMS environment by its ID.",
      readOnlyHint: false, // This tool modifies resources
      destructiveHint: true // This tool is destructive
    },
    // Handler function for deleting an environment
    async ({ apiToken, environmentId, confirmation }) => {
      // Validate confirmation
      if (confirmation !== "confirm") {
        const response = createStandardErrorResponse(
          "You must explicitly confirm deletion by setting confirmation to 'confirm'."
        );
        return createStandardMcpResponse(response);
      }
      
      try {
        // Initialize DatoCMS client - don't pass environmentId when deleting the environment
        // This was causing issues because we're trying to initialize client with the environment we're deleting
        const client = getClient(apiToken);
        
        try {
          // Delete the environment
          await client.environments.destroy(environmentId);

          const response = createStandardSuccessResponse(
            { success: true },
            `Environment '${environmentId}' has been deleted successfully`
          );
          return createStandardMcpResponse(response);
          
        } catch (apiError: unknown) {
          if (isAuthorizationError(apiError)) {
            const response = createStandardErrorResponse(
              "Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.",
              { error_code: "INVALID_API_TOKEN" }
            );
            return createStandardMcpResponse(response);
          }
          
          if (isNotFoundError(apiError)) {
            const response = createStandardErrorResponse(
              `Environment with ID '${environmentId}' was not found.`,
              { error_code: "ENVIRONMENT_NOT_FOUND" }
            );
            return createStandardMcpResponse(response);
          }
          
          const response = createStandardErrorResponse(apiError);
          return createStandardMcpResponse(response);
        }
      } catch (error: unknown) {
        const response = createStandardErrorResponse(
          `Error deleting environment: ${extractDetailedErrorInfo(error)}`
        );
        return createStandardMcpResponse(response);
      }
    }
  );
};

