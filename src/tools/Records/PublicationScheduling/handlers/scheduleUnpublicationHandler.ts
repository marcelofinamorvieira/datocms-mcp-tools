/**
 * @file scheduleUnpublicationHandler.ts
 * @description Handler for scheduling a DatoCMS record unpublication
 * Extracted from the CreateScheduledUnpublicationOnRecord tool
 */

import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import { isAuthorizationError, createErrorResponse , extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import type { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for scheduling a DatoCMS record unpublication
 */
export const scheduleUnpublicationHandler = async (args: z.infer<typeof recordsSchemas.schedule_unpublication>) => {
  const { apiToken, itemId, unpublishing_scheduled_at: unpublicationDate, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environment);
    
    try {
      // Create the scheduled unpublication
      const scheduledUnpublication = await client.scheduledUnpublishing.create(
        itemId,
        {
          unpublishing_scheduled_at: unpublicationDate
        }
      );
      
      return createResponse(JSON.stringify({
        message: "Successfully scheduled the item for unpublication.",
        scheduledUnpublication
      }, null, 2));
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return {
      content: [{
        type: "text" as const,
        text: `Error creating scheduled unpublication: ${extractDetailedErrorInfo(error)}`
      }]
    };
  }
};
