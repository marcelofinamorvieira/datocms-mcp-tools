import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import {
  isAuthorizationError,
  createErrorResponse
, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { uploadsSchemas } from "../../schemas.js";

export const listUploadTagsHandler = async (
  args: z.infer<typeof uploadsSchemas.list_tags>
) => {
  const { apiToken, filter, environment } = args;
  try {
    const client = getClient(apiToken, environment);
    const opts: any = {};
    if (filter) opts.filter = { query: filter };
    const tags = await client.uploadTags.list(opts);
    return createResponse(JSON.stringify(tags, null, 2));
  } catch (e) {
    if (isAuthorizationError(e)) {
      return createErrorResponse("Invalid or unauthorized API token.");
    }
    return createErrorResponse(
      `Error listing upload tags: ${e instanceof Error ? e.message : String(e)}`
    );
  }
};