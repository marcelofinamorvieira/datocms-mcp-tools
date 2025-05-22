/**
 * @file standardizedListEnvironmentsHandler.ts
 * @description Standardized handler for listing DatoCMS environments
 * @module tools/Environments/Read
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { 
  createStandardPaginatedResponse, 
  createStandardMcpResponse,
  PaginationInfo
} from "../../../../utils/standardResponse.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Standardized handler for listing DatoCMS environments
 * 
 * Fetches all environments for a DatoCMS project using the standardized
 * response format. Supports pagination and includes a consistent response structure.
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs number of environments returned
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const standardizedListEnvironmentsHandler = createCustomHandler({
  domain: 'environments',
  schemaName: 'list',
  schema: environmentSchemas.list,
  errorContext: {
    operation: 'list',
    resourceType: 'Environment',
    handlerName: 'standardizedListEnvironmentsHandler'
  }
}, async (args) => {
  const { apiToken } = args;
  
  // Initialize DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken);
  
  // Fetch environments
  const environments = await client.environments.list();
  
  // Create pagination information
  const paginationInfo: PaginationInfo = {
    limit: environments.length,
    offset: 0,
    total: environments.length,
    has_more: false
  };
  
  // Create standardized response
  const response = createStandardPaginatedResponse(
    environments as any[], // Use type assertion to avoid complex type issues
    paginationInfo,
    `Found ${environments.length} environment(s).`
  );
  
  return createStandardMcpResponse(response);
});