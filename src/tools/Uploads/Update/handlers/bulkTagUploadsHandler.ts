import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import {
  isAuthorizationError,
  isNotFoundError,
  createErrorResponse
, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { uploadsSchemas } from "../../schemas.js";

export const bulkTagUploadsHandler = async (
  args: z.infer<typeof uploadsSchemas.bulk_tag>
) => {
  const { apiToken, uploadIds, tags, environment } = args;

  try {
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

    const uploadsParam: { type: "upload"; id: string }[] =
      uploadIds.map(id => ({ type: "upload", id }));
    await client.uploads.bulkTag({ uploads: uploadsParam, tags });

    return createResponse(
      `Successfully tagged ${uploadIds.length} upload(s) with [${tags.join(", ")}].`
    );
  } catch (apiError: unknown) {
    if (isAuthorizationError(apiError)) {
      return createErrorResponse("Invalid or unauthorized API token.");
    }
    if (isNotFoundError(apiError)) {
      return createErrorResponse("One or more uploads not found.");
    }
    return createErrorResponse(
      `Bulk tag error: ${
        extractDetailedErrorInfo(apiError)
      }`
    );
  }
};