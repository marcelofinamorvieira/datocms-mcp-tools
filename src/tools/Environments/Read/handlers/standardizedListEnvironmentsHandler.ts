/**
 * @file standardizedListEnvironmentsHandler.ts
 * @description Standardized handler for listing DatoCMS environments
 * @module tools/Environments/Read
 */

import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import {
  createStandardPaginatedResponse,
  createStandardErrorResponse,
  createStandardMcpResponse,
  PaginationInfo
} from "../../../../utils/standardResponse.js";
import { isAuthorizationError, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Standardized handler for listing DatoCMS environments
 * 
 * Fetches all environments for a DatoCMS project using the standardized
 * response format. Supports pagination and includes a consistent response structure.
 * 
 * @param args - The request arguments
 * @param args.apiToken - DatoCMS API token
 * @returns Environments list with pagination info or error response
 */
export const standardizedListEnvironmentsHandler = createCustomHandler(
  {
    domain: "environments",
    schemaName: "list",
    schema: environmentSchemas.list,
    errorContext: { handlerName: "environments.standardList" }
  },
  async (args) => {
    const { apiToken } = args;

    try {
      const client = UnifiedClientManager.getDefaultClient(apiToken);
      const environments = await client.environments.list();

      const paginationInfo: PaginationInfo = {
        limit: environments.length,
        offset: 0,
        total: environments.length,
        has_more: false
      };

      const response = createStandardPaginatedResponse(
        environments as any[],
        paginationInfo,
        `Found ${environments.length} environment(s).`
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

      const response = createStandardErrorResponse(apiError);
      return createStandardMcpResponse(response);
    }
  }
);
