/**
 * @file listEnvironmentsHandler.ts
 * @description Handler for listing all DatoCMS environments
 */

import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import {
  createStandardSuccessResponse,
  createStandardErrorResponse,
  createStandardMcpResponse
} from "../../../../utils/standardResponse.js";
import { isAuthorizationError, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { environmentSchemas } from "../../schemas.js";

/**
 * Handler for listing all DatoCMS environments
 */
export const listEnvironmentsHandler = async (args: z.infer<typeof environmentSchemas.list>) => {
  const { apiToken } = args;

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

      // Re-throw other API errors to be caught by the outer catch
      const response = createStandardErrorResponse(apiError);
      return createStandardMcpResponse(response);
    }
  } catch (error: unknown) {
    const response = createStandardErrorResponse(
      `Error listing environments: ${extractDetailedErrorInfo(error)}`
    );
    return createStandardMcpResponse(response);
  }
};
