/**
 * @file getEnvironmentHandler.ts
 * @description Handler for retrieving DatoCMS environment information
 * @module tools/Environments/Read
 */

import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import {
  createStandardSuccessResponse,
  createStandardErrorResponse,
  createStandardMcpResponse
} from "../../../../utils/standardResponse.js";
import { isAuthorizationError, isNotFoundError, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { environmentSchemas } from "../../schemas.js";

/**
 * Handler for retrieving a specific DatoCMS environment by ID
 * 
 * @param args - The request arguments
 * @param args.apiToken - DatoCMS API token
 * @param args.environmentId - ID of the environment to retrieve
 * @returns Environment data or error response
 */
export const getEnvironmentHandler = async (args: z.infer<typeof environmentSchemas.retrieve>) => {
  const { apiToken, environmentId } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken);

    try {
      // Fetch environment information
      const environment = await client.environments.find(environmentId as string);

      if (!environment) {
        const response = createStandardErrorResponse(
          `Failed to fetch environment with ID '${environmentId}'.`,
          { error_code: "ENVIRONMENT_NOT_FOUND" }
        );
        return createStandardMcpResponse(response);
      }

      const response = createStandardSuccessResponse(environment as any);
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

      // Re-throw other API errors to be caught by the outer catch
      const response = createStandardErrorResponse(apiError);
      return createStandardMcpResponse(response);
    }
  } catch (error: unknown) {
    const response = createStandardErrorResponse(
      `Error retrieving environment: ${extractDetailedErrorInfo(error)}`
    );
    return createStandardMcpResponse(response);
  }
};
