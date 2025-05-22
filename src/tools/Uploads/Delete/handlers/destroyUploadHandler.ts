import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import {
  isAuthorizationError,
  isNotFoundError,
  createErrorResponse
, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { uploadsSchemas } from "../../schemas.js";

export const destroyUploadHandler = async (
  args: z.infer<typeof uploadsSchemas.destroy>
) => {
  const {
    apiToken,
    uploadId,
    returnOnlyConfirmation,
    environment
  } = args;

  try {
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

    const deleted = await client.uploads.destroy(uploadId);
    if (returnOnlyConfirmation) {
      return createResponse(`Successfully deleted upload '${uploadId}'.`);
    }
    return createResponse(JSON.stringify(deleted, null, 2));
  } catch (apiError: unknown) {
    if (isAuthorizationError(apiError)) {
      return createErrorResponse("Invalid or unauthorized API token.");
    }
    if (isNotFoundError(apiError)) {
      return createErrorResponse(`Upload '${uploadId}' not found.`);
    }
    return createErrorResponse(
      `Error deleting upload: ${
        extractDetailedErrorInfo(apiError)
      }`
    );
  }
};