// Test script to verify Airtable connection
require('dotenv').config();

async function testAirtableConnection() {
  console.log('🔍 Testing Airtable Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log('AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID ? '✅ Set' : '❌ Missing');
  console.log('AIRTABLE_TABLE_NAME:', process.env.AIRTABLE_TABLE_NAME ? '✅ Set' : '❌ Missing');
  
  if (process.env.AIRTABLE_API_KEY) {
    console.log('API Key starts with:', process.env.AIRTABLE_API_KEY.substring(0, 8) + '...');
  }
  
  if (process.env.AIRTABLE_BASE_ID) {
    console.log('Base ID starts with:', process.env.AIRTABLE_BASE_ID.substring(0, 8) + '...');
  }
  
  console.log('Table Name:', process.env.AIRTABLE_TABLE_NAME || 'Not set');
  console.log('');
  
  // Try to load Airtable
  let Airtable;
  try {
    Airtable = require('airtable');
    console.log('✅ Airtable module loaded successfully');
  } catch (error) {
    console.log('❌ Failed to load Airtable module:', error.message);
    return;
  }
  
  // Try to create connection
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.log('❌ Missing required environment variables');
    console.log('\n📝 To fix this, you need to:');
    console.log('1. Get your API key from: https://airtable.com/account');
    console.log('2. Get your Base ID from your Airtable base URL');
    console.log('3. Set the table name (usually "Invoices")');
    return;
  }
  
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    console.log('✅ Airtable connection created');
    
    // Try to fetch a record (just to test authorization)
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Invoices';
    console.log(`🔍 Testing access to table: ${tableName}`);
    
    const records = await base(tableName).select({
      maxRecords: 1
    }).firstPage();
    
    console.log(`✅ Successfully connected to Airtable!`);
    console.log(`📊 Table "${tableName}" is accessible`);
    console.log(`📝 Found ${records.length} record(s) in test query`);
    
    if (records.length > 0) {
      console.log('🔍 Sample field names from your table:');
      const fieldNames = Object.keys(records[0].fields);
      fieldNames.forEach(field => {
        console.log(`   - ${field}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Airtable connection failed:', error.message);
    
    if (error.statusCode === 401) {
      console.log('\n🔑 Authorization Error - This means:');
      console.log('1. Your API key might be incorrect');
      console.log('2. Your API key might not have access to this base');
      console.log('3. Check that your API key is valid at: https://airtable.com/account');
    } else if (error.statusCode === 404) {
      console.log('\n🔍 Not Found Error - This means:');
      console.log('1. Your Base ID might be incorrect');
      console.log('2. Your table name might be wrong');
      console.log('3. Check your base URL and table name');
    }
    
    console.log('\n📝 Troubleshooting steps:');
    console.log('1. Go to https://airtable.com/account and copy your API key');
    console.log('2. Go to your Airtable base and copy the Base ID from the URL');
    console.log('3. Make sure your table name is exactly: "Invoices"');
    console.log('4. Make sure your API key has access to this base');
  }
}

testAirtableConnection().catch(console.error);
