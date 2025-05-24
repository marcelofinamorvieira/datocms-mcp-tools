/**
 * @file buildRecordEditorUrlFromTypeHandler.ts
 * @description Handler for building the DatoCMS editor URL for a specific record using project URL and item type ID
 */

import { createResponse, Response as McpResponse } from "../../../../utils/responseHandlers.js";
import { recordsSchemas } from "../../schemas.js";
import { z } from "zod";

// Use the schema's inferred type
type BuildRecordUrlParams = z.infer<typeof recordsSchemas.record_url>;

/**
 * Handler to build the editor URL for a specific DatoCMS record using project URL and item type
 * Extracted from the BuildDatoCMSRecordUrl tool
 * 
 * Note: This handler doesn't need API access, so we use a direct function instead of factory
 */
export const buildRecordEditorUrlFromTypeHandler = async (args: BuildRecordUrlParams): Promise<McpResponse> => {
  const { projectUrl, itemTypeId, itemId, environment } = args;
  
  // Validate required parameters
  if (!projectUrl) {
    throw new Error("A valid project URL is required.");
  }
  
  if (!itemTypeId) {
    throw new Error("A valid item type ID is required.");
  }
  
  if (!itemId) {
    throw new Error("A valid record ID is required.");
  }
  
  // Sanitize the project URL by removing trailing slashes
  const sanitizedProjectUrl = projectUrl.replace(/\/$/, '');
  
  // Construct the editor URL
  let editorUrl = `https://${sanitizedProjectUrl}/editor/item_types/${itemTypeId}/items/${itemId}/edit`;
  
  // Add environment parameter if specified
  if (environment) {
    editorUrl += `?environment=${encodeURIComponent(environment)}`;
  }
  
  // Return the response using the same format as the original tool
  const result = {
    message: "Here is the URL for the DatoCMS record. You can use this to directly access the record in the DatoCMS editor.",
    url: editorUrl
  };
  
  return createResponse(JSON.stringify(result, null, 2));
};
