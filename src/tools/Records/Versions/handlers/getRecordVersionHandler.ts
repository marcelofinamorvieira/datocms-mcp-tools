/**
 * @file getRecordVersionHandler.ts
 * @description Handler for retrieving a specific version of a DatoCMS record
 * Extracted from the GetDatoCMSRecordVersion tool
 */

import { createRetrieveHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for retrieving a specific version of a DatoCMS record
 */
export const getRecordVersionHandler = createRetrieveHandler({
  domain: "records",
  schemaName: "version_get",
  schema: recordsSchemas.version_get,
  entityName: "Record Version",
  idParam: "versionId",
  clientAction: async (client, args) => {
    const { versionId } = args;
    
    // Fetch the specific version of the record
    const itemVersion = await client.itemVersions.find(versionId);
    
    // Return the version information
    return {
      message: `Successfully retrieved record version with ID: ${versionId}`,
      version: itemVersion
    };
  }
});
