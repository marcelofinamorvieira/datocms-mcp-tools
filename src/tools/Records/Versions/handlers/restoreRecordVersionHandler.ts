/**
 * @file restoreRecordVersionHandler.ts
 * @description Handler for restoring a specific version of a DatoCMS record
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createUpdateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import type { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler for restoring a specific version of a DatoCMS record
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs version restoration details
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const restoreRecordVersionHandler = createUpdateHandler<any, SimpleSchemaTypes.ItemVersionRestoreJobSchema>({
  domain: 'records.versions',
  schemaName: 'version_restore',
  schema: recordsSchemas.version_restore,
  entityName: 'Record Version',
  idParam: 'versionId',
  successMessage: (_result) => `Successfully initiated version restoration job.`,
  clientAction: async (client, args) => {
    const { versionId } = args;
    
    // Restore the specified version
    const restoredVersion = await client.itemVersions.restore(versionId);
    
    return restoredVersion;
  }
});
