/**
 * @file test-debug.ts
 * @description Test script to demonstrate debug functionality
 * 
 * Run this script with DEBUG=true in your .env file to see debug output
 */

import { createRecordHandler } from '../src/tools/Records/Create/handlers/createRecordHandler.js';
import { getRecordByIdHandler } from '../src/tools/Records/Read/handlers/getRecordByIdHandler.js';

async function testDebugFunctionality() {
  console.log('=== DatoCMS MCP Debug Test ===\n');
  console.log('DEBUG mode is:', process.env.DEBUG);
  console.log('TRACK_PERFORMANCE is:', process.env.TRACK_PERFORMANCE);
  console.log('\n');

  // Test data
  const apiToken = 'test-api-token-123456';
  const itemType = 'blog_post';
  const recordData = {
    title: { en: 'Test Blog Post' },
    content: { en: 'This is a test blog post created to demonstrate debug functionality.' }
  };

  console.log('1. Testing Create Record Handler (should fail with invalid token):\n');
  
  try {
    const createArgs = {
      api_token: apiToken,
      itemType: itemType,
      data: recordData,
      returnOnlyConfirmation: false
    };

    const createResult = await createRecordHandler(createArgs);
    
    // Parse and display the response
    if (createResult.content && createResult.content[0]) {
      const responseData = JSON.parse(createResult.content[0].text);
      console.log('Response:', JSON.stringify(responseData, null, 2));
      
      if (responseData.meta?.debug) {
        console.log('\n=== Debug Information ===');
        console.log('Operation:', responseData.meta.debug.context.operation);
        console.log('Handler:', responseData.meta.debug.context.handler);
        console.log('Duration:', responseData.meta.debug.context.performance?.duration, 'ms');
        console.log('Trace:', responseData.meta.debug.context.trace);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n2. Testing Get Record Handler (should fail with invalid token):\n');
  
  try {
    const getArgs = {
      api_token: apiToken,
      itemId: 'test-record-id',
      version: 'published' as const,
      returnAllLocales: false,
      nested: true
    };

    const getResult = await getRecordByIdHandler(getArgs);
    
    // Parse and display the response
    if (getResult.content && getResult.content[0]) {
      const responseData = JSON.parse(getResult.content[0].text);
      console.log('Response:', JSON.stringify(responseData, null, 2));
      
      if (responseData.meta?.debug) {
        console.log('\n=== Debug Information ===');
        console.log('Operation:', responseData.meta.debug.context.operation);
        console.log('Handler:', responseData.meta.debug.context.handler);
        console.log('Duration:', responseData.meta.debug.context.performance?.duration, 'ms');
        console.log('Parameters (sanitized):', responseData.meta.debug.context.parameters);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }

  console.log('\n=== Test Complete ===');
}

// Run the test
testDebugFunctionality().catch(console.error);