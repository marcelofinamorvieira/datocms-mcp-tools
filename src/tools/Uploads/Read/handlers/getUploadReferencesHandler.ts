import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import {
  isAuthorizationError,
  isNotFoundError,
  createErrorResponse,
  extractDetailedErrorInfo 
} from "../../../../utils/errorHandlers.js";
import { uploadsSchemas } from "../../schemas.js";
import { createTypedUploadsClient } from "../../uploadsClient.js";
import { GetUploadReferencesResponse, isUploadsAuthorizationError, isUploadsNotFoundError } from "../../uploadsTypes.js";

export const getUploadReferencesHandler = async (
  args: z.infer<typeof uploadsSchemas.references>
): Promise<GetUploadReferencesResponse> => {
  const {
    apiToken,
    uploadId,
    nested,
    version,
    returnOnlyIds,
    environment
  } = args;

  try {
    const client = getClient(apiToken, environment);
    const typedClient = createTypedUploadsClient(client);

    // Get references using typed client
    const references = await typedClient.getUploadReferences(uploadId, {
      nested,
      version
    });

    // Return appropriate response based on result and requested format
    if (!references.length) {
      return {
        success: true,
        data: [],
        message: "No records reference this upload."
      };
    }
    
    if (returnOnlyIds) {
      return {
        success: true,
        data: references.map(r => ({ id: r.id, type: r.type })) as any, // Type casting due to partial result
        message: `Found ${references.length} references to this upload.`
      };
    }
    
    return {
      success: true,
      data: references,
      message: `Found ${references.length} references to this upload.`
    };
  } catch (apiError: unknown) {
    if (isUploadsAuthorizationError(apiError)) {
      return {
        success: false,
        error: "Error: Invalid or unauthorized API token."
      };
    }
    if (isUploadsNotFoundError(apiError)) {
      return {
        success: false,
        error: `Error: Upload '${uploadId}' not found.`
      };
    }
    return {
      success: false,
      error: `Error fetching references: ${extractDetailedErrorInfo(apiError)}`
    };
  }
};