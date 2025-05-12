/**
 * Utility functions for error handling and response formatting in DatoCMS MCP tools
 */

/**
 * Utility function to check if an error is an authorization error
 */
export const isAuthorizationError = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error && error.status === 401 ||
     'message' in error && typeof error.message === 'string' &&
     (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')))
  );
};

/**
 * Utility function to check if an error is a not found error
 */
export const isNotFoundError = (error: unknown): boolean => {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error && error.status === 404 ||
     'message' in error && typeof error.message === 'string' &&
     (error.message.includes('404') || error.message.toLowerCase().includes('not found')))
  );
};

/**
 * Utility function to extract detailed information from DatoCMS API errors
 */
export const extractDetailedErrorInfo = (error: unknown): string => {
  if (!error) return 'Unknown error occurred';

  // If it's already a string, just return it
  if (typeof error === 'string') return error;

  // If it's an Error object
  if (error instanceof Error) {
    const errorMessage = error.message;

    try {
      // Try to find JSON in error message that might contain detailed error information
      const jsonMatch = errorMessage.match(/\{.*\}/s);
      if (jsonMatch) {
        const errorJson = JSON.parse(jsonMatch[0]);

        // If we have structured error data
        if (errorJson.data && errorJson.data.errors) {
          return `${errorMessage}\n\nDetails: ${JSON.stringify(errorJson.data.errors, null, 2)}`;
        }

        // If there are general errors
        if (errorJson.errors) {
          return `${errorMessage}\n\nDetails: ${JSON.stringify(errorJson.errors, null, 2)}`;
        }
      }

      // Try to parse out error details from common error formats
      if (errorMessage.includes('Unprocessable') || errorMessage.includes('422')) {
        const errorDetailsMatch = errorMessage.match(/422[^{]*(\{.*\})/s);
        if (errorDetailsMatch && errorDetailsMatch[1]) {
          try {
            const errorDetails = JSON.parse(errorDetailsMatch[1]);
            if (errorDetails.errors || errorDetails.data?.errors) {
              const errors = errorDetails.errors || errorDetails.data?.errors;
              return `${errorMessage}\n\nDetails: ${JSON.stringify(errors, null, 2)}`;
            }
          } catch (e) {
            // If parsing fails, continue with normal flow
          }
        }
      }
    } catch (e) {
      // If JSON parsing fails, continue with normal flow
    }

    return errorMessage;
  }

  // If it's an object
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      // Try to extract more info from the message
      return extractDetailedErrorInfo(error.message);
    }

    // If it has errors property with detailed information
    if ('errors' in error && error.errors) {
      return `Error: ${JSON.stringify(error.errors, null, 2)}`;
    }

    // If it has data.errors with detailed information
    if ('data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'errors' in error.data) {
      return `Error: ${JSON.stringify(error.data.errors, null, 2)}`;
    }

    return JSON.stringify(error, null, 2);
  }

  // Default fallback
  return String(error);
};

/**
 * Utility function to create an error response with the correct MCP content structure
 */
export const createErrorResponse = (message: string) => {
  return {
    content: [{
      type: "text" as const,
      text: message
    }]
  };
};
