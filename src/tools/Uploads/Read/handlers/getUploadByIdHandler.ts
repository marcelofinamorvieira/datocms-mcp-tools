import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import {
  isAuthorizationError,
  isNotFoundError,
  createErrorResponse,
  extractDetailedErrorInfo 
} from "../../../../utils/errorHandlers.js";
import type { uploadsSchemas } from "../../schemas.js";
import { createTypedUploadsClient } from "../../uploadsClient.js";
import { GetUploadResponse, isUploadsAuthorizationError, isUploadsNotFoundError } from "../../uploadsTypes.js";

export const getUploadByIdHandler = async (
  args: z.infer<typeof uploadsSchemas.get>
): Promise<GetUploadResponse> => {
  const { apiToken, uploadId, environment } = args;

  try {
    const client = getClient(apiToken, environment);
    const typedClient = createTypedUploadsClient(client);

    try {
      const upload = await typedClient.findUpload(uploadId);
      
      // Return success response
      return {
        success: true,
        data: upload
      };
    } catch (apiError: unknown) {
      if (isUploadsAuthorizationError(apiError)) {
        return {
          success: false,
          error: "Error: Invalid or unauthorized DatoCMS API token."
        };
      }
      if (isUploadsNotFoundError(apiError)) {
        return {
          success: false,
          error: `Error: Upload with ID '${uploadId}' was not found.`
        };
      }
      throw apiError;
    }
  } catch (err) {
    return {
      success: false,
      error: `Error retrieving upload: ${err instanceof Error ? err.message : String(err)}`
    };
  }
};