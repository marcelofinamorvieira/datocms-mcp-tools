/**
 * @file forkEnvironmentHandler.ts
 * @description Handler for forking a DatoCMS environment
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
 * Handler for forking a DatoCMS environment
 */
export const forkEnvironmentHandler = async (args: z.infer<typeof environmentSchemas.fork>) => {
  const { apiToken, environmentId, newId, fast = false, force = false } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environmentId);
    
    try {
      // Fork the environment with immediate_return set to false
      // to wait for the completion of the fork operation
      const forkOptions = {
        id: newId,
        immediate_return: false,
        fast,
        force
      };
      
      const environment = await client.environments.fork(environmentId, forkOptions);

      if (!environment) {
        const response = createStandardErrorResponse(
          `Failed to fork environment with ID '${environmentId}'.`,
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
      `Error forking environment: ${extractDetailedErrorInfo(error)}`
    );
    return createStandardMcpResponse(response);
  }
};
