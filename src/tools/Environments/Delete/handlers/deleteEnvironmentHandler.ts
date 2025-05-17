/**
 * @file deleteEnvironmentHandler.ts
 * @description Handler for deleting a DatoCMS environment
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
 * Handler for deleting a DatoCMS environment
 */
export const deleteEnvironmentHandler = async (args: z.infer<typeof environmentSchemas.delete>) => {
  const { apiToken, environmentId } = args;
  
  try {
    // Initialize DatoCMS client - don't pass environmentId when deleting the environment
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
};
