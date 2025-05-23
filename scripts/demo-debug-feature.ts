/**
 * Demo script to show the debug feature in action
 * This demonstrates how the new per-request debug parameter works
 */

import { listItemTypesHandler } from "../src/tools/Schema/ItemType/Read/handlers/listItemTypesHandler.js";
import { createDebugContext, addTrace, formatBytes } from "../src/utils/debugUtils.js";

// Mock a successful response for demo purposes
const mockSuccessResponse = {
  content: [{
    type: 'text' as const,
    text: JSON.stringify({
      success: true,
      data: [
        { id: "1", name: "Blog Post", api_key: "blog_post" },
        { id: "2", name: "Author", api_key: "author" },
        { id: "3", name: "Category", api_key: "category" }
      ]
    }, null, 2)
  }]
};

// Create a demo handler that shows debug functionality
async function demoDebugHandler(args: any) {
  const requestDebug = args.debug;
  
  if (!requestDebug) {
    // Without debug, just return the response
    return mockSuccessResponse;
  }
  
  // With debug enabled, create debug context and add traces
  const context = createDebugContext({
    operation: 'list',
    handler: 'listItemTypes',
    domain: 'schema',
    requestDebug: true,
    parameters: {
      apiToken: 'demo-***-token',
      environment: args.environment || 'main',
      debug: true
    }
  });
  
  // Simulate operation steps
  addTrace(context, 'Starting operation: list in domain: schema');
  addTrace(context, 'Validating input parameters');
  addTrace(context, 'Creating API client');
  addTrace(context, 'Executing API call: itemTypes.list');
  addTrace(context, 'API call completed successfully');
  addTrace(context, 'Operation completed successfully');
  
  // Add the debug info to the response
  const responseData = JSON.parse(mockSuccessResponse.content[0].text);
  responseData.debug = {
    traces: context.trace,
    performance: {
      totalDuration: "45ms",
      apiCallDuration: "42ms",
      validationDuration: "1ms"
    },
    context: {
      operation: context.operation,
      handler: context.handler,
      domain: context.domain,
      timestamp: new Date(context.timestamp).toISOString()
    },
    sanitizedParams: context.parameters
  };
  
  return {
    content: [{
      type: 'text' as const,
      text: JSON.stringify(responseData, null, 2)
    }]
  };
}

async function runDemo() {
  console.log("=== DatoCMS MCP Debug Feature Demo ===\n");
  
  console.log("1. Request WITHOUT debug flag:");
  console.log("   Request: { apiToken: 'xxx', environment: 'main' }\n");
  
  const normalResponse = await demoDebugHandler({
    apiToken: 'demo-token',
    environment: 'main'
  });
  
  console.log("   Response:");
  console.log(normalResponse.content[0].text);
  
  console.log("\n\n2. Request WITH debug flag:");
  console.log("   Request: { apiToken: 'xxx', environment: 'main', debug: true }\n");
  
  const debugResponse = await demoDebugHandler({
    apiToken: 'demo-token',
    environment: 'main',
    debug: true
  });
  
  console.log("   Response:");
  console.log(debugResponse.content[0].text);
  
  console.log("\n\n=== Key Features ===");
  console.log("✅ Per-request debug control - no global state");
  console.log("✅ Detailed execution traces with timestamps");
  console.log("✅ Performance metrics (duration breakdowns)");
  console.log("✅ Sanitized parameters (API tokens redacted)");
  console.log("✅ Multi-user safe - no cross-contamination");
  console.log("✅ Works with all MCP tools automatically");
}

runDemo().catch(console.error);