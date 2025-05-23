/**
 * Maximum character length for a single MCP response block to avoid truncation
 * The MCP reference protocol caps each response at 100,000 UTF-8 characters
 */
const MAX_RESPONSE_LENGTH = 100000;
/**
 * Splits large text responses into smaller chunks that stay within MCP size limits
 * @param text The text content to be chunked
 * @returns An array of text block chunks that conform to MCP size limits
 */
export const chunkTextResponse = (text) => {
    // If text is small enough, return it as a single block
    if (text.length <= MAX_RESPONSE_LENGTH) {
        return [{ type: "text", text }];
    }
    // Split the text into chunks
    const chunks = [];
    // Use regex to split the text into chunks of appropriate size
    // The regex matches up to MAX_RESPONSE_LENGTH characters
    const textChunks = text.match(new RegExp(`.{1,${MAX_RESPONSE_LENGTH}}`, "gs")) || [];
    // Convert each text chunk to a proper MCP TextBlock
    for (const chunk of textChunks) {
        chunks.push({ type: "text", text: chunk });
    }
    return chunks;
};
/**
 * Creates an MCP response, automatically chunking if the text exceeds size limits
 * Only chunks the response if necessary (text > 100k characters)
 * @param textOrObject The text or object to include in the response
 * @returns An MCP response object with properly sized content blocks
 */
export const createResponse = (textOrObject) => {
    // Check if it's a standard HandlerResponse
    if (typeof textOrObject === 'object' && textOrObject !== null && 'status' in textOrObject) {
        const handlerResponse = textOrObject;
        // Build the response appropriately based on data or message
        if (handlerResponse.data) {
            // Return both the status, message (if any), and data
            return {
                content: chunkTextResponse(JSON.stringify({
                    status: handlerResponse.status,
                    message: handlerResponse.message,
                    data: handlerResponse.data
                }, null, 2))
            };
        }
        else if (handlerResponse.message) {
            // Return just the status and message
            return {
                content: chunkTextResponse(JSON.stringify({
                    status: handlerResponse.status,
                    message: handlerResponse.message
                }, null, 2))
            };
        }
    }
    // Handle regular text or object as before
    const text = typeof textOrObject === 'string'
        ? textOrObject
        : JSON.stringify(textOrObject, null, 2);
    return {
        content: chunkTextResponse(text)
    };
};
/**
 * Creates a successful response with optional data and message
 * @param data Optional data to include in the response
 * @param message Optional message to include in the response
 * @returns A HandlerResponse object with status 'success'
 */
export const createSuccessResponse = (data, message) => {
    return {
        status: 'success',
        ...(data !== undefined && { data }),
        ...(message !== undefined && { message })
    };
};
/**
 * Creates an error response with a message
 * @param message Error message to include in the response
 * @param data Optional error data to include in the response
 * @returns A HandlerResponse object with status 'error'
 */
export const createErrorHandlerResponse = (message, data) => {
    return {
        status: 'error',
        message,
        ...(data !== undefined && { data })
    };
};
