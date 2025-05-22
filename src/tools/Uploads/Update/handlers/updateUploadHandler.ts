import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import {
  isAuthorizationError,
  isNotFoundError,
  createErrorResponse
, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { uploadsSchemas } from "../../schemas.js";

export const updateUploadHandler = async (
  args: z.infer<typeof uploadsSchemas.update>
) => {
  const { apiToken, uploadId, environment, ...updateData } = args;

  try {
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

    const updated = await client.uploads.update(uploadId, updateData as any);

    return createResponse(JSON.stringify(updated, null, 2));
  } catch (apiError: unknown) {
    if (isAuthorizationError(apiError)) {
      return createErrorResponse("Invalid or unauthorized API token.");
    }
    if (isNotFoundError(apiError)) {
      return createErrorResponse(`Upload '${uploadId}' not found.`);
    }
    return createErrorResponse(
      `Error updating upload: ${
        extractDetailedErrorInfo(apiError)
      }`
    );
  }
};