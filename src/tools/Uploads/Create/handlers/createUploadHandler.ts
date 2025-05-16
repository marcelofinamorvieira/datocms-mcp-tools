import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import fetch, { Response as FetchResponse } from "node-fetch";
import fs from "node:fs/promises";
import path from "node:path";
import mime from "mime-types";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { withErrorHandling } from "../../../../utils/errorHandlerWrapper.js";
import { uploadsSchemas } from "../../schemas.js";

interface UploadRequestResponse {
  data: {
    id: string;
    attributes: { url: string; request_headers?: Record<string, string> };
  };
}

const getFilenameFromUrl = (url: string) => {
  const clean = url.split("?")[0];
  return clean.substring(clean.lastIndexOf("/") + 1) || "downloaded-file";
};

export const createUploadHandlerImplementation = async (
  args: z.infer<typeof uploadsSchemas.create>
) => {
  const {
    apiToken,
    url,
    path: filePath,
    id,
    filename,
    skipCreationIfAlreadyExists,
    author,
    copyright,
    notes,
    tags,
    default_field_metadata,
    upload_collection,
    environment
  } = args;

  // 1) Read file buffer
  let fileContent: Buffer;
  let fileContentType: string;
  let actualFilename: string;

  if (url) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error fetching remote file: ${res.status} ${res.statusText}`);
    }
    fileContent = Buffer.from(await res.arrayBuffer());
    fileContentType = res.headers.get("content-type") || "application/octet-stream";
    actualFilename = filename || getFilenameFromUrl(url);
    if (!actualFilename.includes(".")) {
      const ext = mime.extension(fileContentType);
      if (ext) actualFilename += `.${ext}`;
    }
  } else if (filePath) {
    try {
      fileContent = await fs.readFile(filePath);
    } catch (err) {
      throw new Error(`Error reading file: ${err instanceof Error ? err.message : String(err)}`);
    }
    fileContentType = mime.lookup(filePath) || "application/octet-stream";
    actualFilename = filename || path.basename(filePath);
  } else {
    throw new Error("Either 'url' or 'path' must be provided.");
  }

  // 2) Request upload permission
  let uploadRequestRes: FetchResponse;
  try {
    uploadRequestRes = await fetch(
      "https://site-api.datocms.com/upload-requests",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          Accept: "application/json",
          "X-Api-Version": "3",
          "Content-Type": "application/vnd.api+json",
          ...(environment ? { "X-Environment": environment } : {})
        },
        body: JSON.stringify({
          data: { type: "upload_request", attributes: { filename: actualFilename } }
        })
      }
    );
  } catch (err) {
    throw new Error(`Error requesting upload permission: ${err instanceof Error ? err.message : String(err)}`);
  }
  
  if (!uploadRequestRes.ok) {
    const txt = await uploadRequestRes.text();
    throw new Error(`Upload request failed: ${uploadRequestRes.status} ${txt}`);
  }
  
  const reqData = (await uploadRequestRes.json()) as UploadRequestResponse;
  const uploadId = reqData.data.id;
  const bucketUrl = reqData.data.attributes.url;
  const bucketHeaders = reqData.data.attributes.request_headers || {};

  // 3) Upload to bucket
  const bucketRes = await fetch(bucketUrl, {
    method: "PUT",
    headers: { ...bucketHeaders, "Content-Type": fileContentType },
    body: fileContent
  });
  
  if (!bucketRes.ok) {
    const txt = await bucketRes.text();
    throw new Error(`Error uploading file to bucket: ${bucketRes.status} ${txt}`);
  }

  // 4) Create upload resource
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

  const payload: any = {
    uploadId,
    path: uploadId
  };
  if (id) payload.id = id;
  if (author !== undefined) payload.author = author;
  if (copyright !== undefined) payload.copyright = copyright;
  if (notes !== undefined) payload.notes = notes;
  if (tags) payload.tags = tags;
  if (default_field_metadata) payload.default_field_metadata = default_field_metadata;
  if (upload_collection !== undefined) payload.upload_collection = upload_collection;
  if (url && skipCreationIfAlreadyExists)
    payload.skip_creation_if_already_exists = skipCreationIfAlreadyExists;

  const upload = await client.uploads.create(payload);
  return createResponse(JSON.stringify(upload, null, 2));
};

// Wrap with consistent error handling
export const createUploadHandler = withErrorHandling(
  createUploadHandlerImplementation,
  {
    handlerName: "createUpload",
    resourceType: "upload"
  }
);