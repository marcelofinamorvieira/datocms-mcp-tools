/**
 * @file testEnhancedHandler.ts
 * @description Test file for the enhanced handler factory
 * This file tests the functionality of the enhanced handler factory
 */

import { UnifiedClientManager, ClientType } from './unifiedClientManager.js';
import { SchemaRegistry } from './schemaRegistry.js';
import { 
  createCreateHandler, 
  createRetrieveHandler,
  createListHandler,
  createUpdateHandler,
  createDeleteHandler
} from './enhancedHandlerFactory.js';
import { z } from 'zod';

// Mock schemas for testing
const testSchema = z.object({
  apiToken: z.string(),
  environment: z.string().optional(),
  id: z.string().optional(),
  data: z.record(z.any()).optional()
});

// Register the test schema
SchemaRegistry.register('test', 'test', testSchema);

// Create a test handler using the enhanced handler factory
const testHandler = createListHandler({
  domain: 'test',
  schemaName: 'test',
  schema: testSchema,
  entityName: 'Test',
  clientType: ClientType.DEFAULT,
  errorContext: {
    handlerName: 'test.list',
    resourceType: 'Test'
  },
  clientAction: async (client, args) => {
    // Mock client action
    console.log('Client action called with:', args);
    return [{ id: '1', name: 'Test 1' }, { id: '2', name: 'Test 2' }];
  },
  formatResult: (results) => {
    return {
      message: `Found ${results.length} results`,
      data: results
    };
  }
});

// Test the handler
async function runTest() {
  try {
    console.log('Testing enhanced handler factory...');
    
    // Test with valid input
    const validResult = await testHandler({ 
      apiToken: 'test-token',
      environment: 'test-env' 
    });
    console.log('Valid input result:', validResult);
    
    // Test with invalid input (should be caught by schema validation)
    try {
      // @ts-ignore - Deliberately testing with invalid input
      const invalidResult = await testHandler({});
      console.log('Invalid input result:', invalidResult);
    } catch (error) {
      console.log('Error caught (expected):', error);
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest();