/**
 * Field Creation Test Script
 * Tests various field creation scenarios to verify they work correctly
 */

import { getClient } from '../src/utils/clientManager.js';

// Replace these with your own test values
const API_TOKEN = 'your_api_token';
const ITEM_TYPE_ID = 'your_item_type_id';
const ENVIRONMENT = 'main';

// Get timestamp to make API keys unique
const timestamp = Date.now();

async function testFieldCreation() {
  try {
    // Get the client
    const client = getClient(API_TOKEN, ENVIRONMENT);
    
    console.log('Starting field creation tests...');
    
    // Test 1: String field with single_line
    console.log('\nTest 1: Creating string field with single_line editor...');
    try {
      const stringField = await client.fields.create(ITEM_TYPE_ID, {
        type: 'field',
        attributes: {
          label: `String Single Line ${timestamp}`,
          api_key: `string_single_line_${timestamp}`,
          field_type: 'string',
          validators: { required: {} },
          appearance: {
            editor: 'single_line',
            parameters: {},
            addons: []
          }
        }
      });
      console.log(`✅ Success: Created string field with ID ${stringField.id}`);
    } catch (error) {
      console.error('❌ Failed:', error);
    }
    
    // Test 2: String field with radio_group
    console.log('\nTest 2: Creating string field with string_radio_group editor...');
    try {
      const radioField = await client.fields.create(ITEM_TYPE_ID, {
        type: 'field',
        attributes: {
          label: `String Radio Group ${timestamp}`,
          api_key: `string_radio_group_${timestamp}`,
          field_type: 'string',
          validators: {
            required: {},
            enum: { values: ['option_a', 'option_b', 'option_c'] }
          },
          appearance: {
            editor: 'string_radio_group',
            parameters: {
              radios: [
                { label: 'Option A', value: 'option_a' },
                { label: 'Option B', value: 'option_b' },
                { label: 'Option C', value: 'option_c' }
              ]
            },
            addons: []
          }
        }
      });
      console.log(`✅ Success: Created radio group field with ID ${radioField.id}`);
    } catch (error) {
      console.error('❌ Failed:', error);
    }
    
    // Test 3: Text field with textarea
    console.log('\nTest 3: Creating text field with textarea editor...');
    try {
      const textareaField = await client.fields.create(ITEM_TYPE_ID, {
        type: 'field',
        attributes: {
          label: `Text Textarea ${timestamp}`,
          api_key: `text_textarea_${timestamp}`,
          field_type: 'text',
          validators: { required: {} },
          appearance: {
            editor: 'textarea',
            parameters: { placeholder: 'Enter text here...' },
            addons: []
          }
        }
      });
      console.log(`✅ Success: Created textarea field with ID ${textareaField.id}`);
    } catch (error) {
      console.error('❌ Failed:', error);
    }
    
    // Test 4: Location field
    console.log('\nTest 4: Creating location field with map editor...');
    try {
      const locationField = await client.fields.create(ITEM_TYPE_ID, {
        type: 'field',
        attributes: {
          label: `Location Field ${timestamp}`,
          api_key: `location_field_${timestamp}`,
          field_type: 'lat_lon',
          validators: { required: {} },
          appearance: {
            editor: 'map', // Use map, not lat_lon_editor
            parameters: {},
            addons: []
          }
        }
      });
      console.log(`✅ Success: Created location field with ID ${locationField.id}`);
    } catch (error) {
      console.error('❌ Failed:', error);
    }
    
    // Test 5: Slug field
    console.log('\nTest 5: Creating slug field...');
    try {
      const slugField = await client.fields.create(ITEM_TYPE_ID, {
        type: 'field',
        attributes: {
          label: `Slug Field ${timestamp}`,
          api_key: `slug_field_${timestamp}`,
          field_type: 'slug',
          validators: { 
            required: {},
            unique: {} 
          },
          appearance: {
            editor: 'slug',
            parameters: { url_prefix: 'https://example.com/' },
            addons: []
          }
        }
      });
      console.log(`✅ Success: Created slug field with ID ${slugField.id}`);
    } catch (error) {
      console.error('❌ Failed:', error);
    }
    
    // Test 6: JSON field with checkbox group
    console.log('\nTest 6: Creating JSON field with checkbox group...');
    try {
      const jsonField = await client.fields.create(ITEM_TYPE_ID, {
        type: 'field',
        attributes: {
          label: `JSON Checkbox Group ${timestamp}`,
          api_key: `json_checkbox_group_${timestamp}`,
          field_type: 'json',
          validators: { required: {} },
          appearance: {
            editor: 'string_checkbox_group',
            parameters: {
              options: [
                { label: 'Option A', value: 'option_a' },
                { label: 'Option B', value: 'option_b' },
                { label: 'Option C', value: 'option_c' }
              ]
            },
            addons: []
          }
        }
      });
      console.log(`✅ Success: Created JSON checkbox group field with ID ${jsonField.id}`);
    } catch (error) {
      console.error('❌ Failed:', error);
    }
    
    console.log('\nAll tests completed.');
    
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

// Run the test
testFieldCreation();