import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import {
  isAuthorizationError,
  isNotFoundError,
  createErrorResponse
, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { uploadsSchemas } from "../../schemas.js";

export const bulkDestroyUploadsHandler = async (
  args: z.infer<typeof uploadsSchemas.bulk_destroy>
) => {
  const { apiToken, uploadIds, environment } = args;
  if (!uploadIds.length) {
    return createErrorResponse("No upload IDs provided.");
  }
  if (uploadIds.length > 200) {
    return createErrorResponse("Max 200 uploads per bulk delete.");
  }

  try {
    const client = getClient(apiToken, environment);

    const uploadsParam: { type: "upload"; id: string }[] =
      uploadIds.map(id => ({ type: "upload", id }));
    await client.uploads.bulkDestroy({ uploads: uploadsParam });

    return createResponse(
      `Successfully deleted ${uploadIds.length} upload(s).`
    );
  } catch (apiError: unknown) {
    if (isAuthorizationError(apiError)) {
      return createErrorResponse("Invalid or unauthorized API token.");
    }
    if (isNotFoundError(apiError)) {
      return createErrorResponse("One or more uploads not found.");
    }
    return createErrorResponse(
      `Bulk delete error: ${
        extractDetailedErrorInfo(apiError)
      }`
    );
  }
};