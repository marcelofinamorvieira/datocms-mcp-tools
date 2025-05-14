import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import {
  isAuthorizationError,
  createErrorResponse
, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { uploadsSchemas } from "../../schemas.js";

export const createUploadTagHandler = async (
  args: z.infer<typeof uploadsSchemas.create_tag>
) => {
  const { apiToken, name, environment } = args;
  try {
    const client = getClient(apiToken, environment);
    const tag = await client.uploadTags.create({ name });
    return createResponse(JSON.stringify(tag, null, 2));
  } catch (e) {
    if (isAuthorizationError(e)) {
      return createErrorResponse("Invalid or unauthorized API token.");
    }
    return createErrorResponse(
      `Error creating upload tag: ${e instanceof Error ? e.message : String(e)}`
    );
  }
};