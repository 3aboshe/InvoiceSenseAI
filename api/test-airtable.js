// Test Airtable connection and configuration
let Airtable;
try {
  Airtable = require('airtable');
} catch (error) {
  console.warn('Airtable module not found');
}

// Initialize Airtable client
const base = process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID && Airtable
  ? new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)
  : null;

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('Testing Airtable connection...');
    
    const config = {
      hasAirtable: !!Airtable,
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      hasTableName: !!process.env.AIRTABLE_TABLE_NAME,
      apiKeyLength: process.env.AIRTABLE_API_KEY ? process.env.AIRTABLE_API_KEY.length : 0,
      baseId: process.env.AIRTABLE_BASE_ID,
      tableName: process.env.AIRTABLE_TABLE_NAME,
      hasBase: !!base
    };

    console.log('Configuration:', config);

    if (!base) {
      return res.json({
        success: false,
        error: 'Airtable base not initialized',
        config
      });
    }

    // Test 1: List all tables in the base
    console.log('Testing table listing...');
    let tables = [];
    try {
      tables = await base.tables();
      console.log('Available tables:', tables.map(t => t.name));
    } catch (error) {
      console.error('Error listing tables:', error);
    }

    // Test 2: Try to access the specific table
    console.log('Testing table access...');
    let tableInfo = null;
    let tableError = null;
    
    if (process.env.AIRTABLE_TABLE_NAME) {
      try {
        const table = base(process.env.AIRTABLE_TABLE_NAME);
        // Try to get the first record to test access
        const records = await table.select({ maxRecords: 1 }).firstPage();
        tableInfo = {
          name: process.env.AIRTABLE_TABLE_NAME,
          recordCount: records.length,
          fields: records.length > 0 ? Object.keys(records[0].fields) : []
        };
        console.log('Table access successful:', tableInfo);
      } catch (error) {
        tableError = {
          message: error.message,
          code: error.code,
          status: error.status
        };
        console.error('Error accessing table:', tableError);
      }
    }

    // Test 3: Try to create a test record
    console.log('Testing record creation...');
    let testRecord = null;
    let createError = null;
    
    if (process.env.AIRTABLE_TABLE_NAME && !tableError) {
      try {
        const testData = {
          'Company': 'Test Company',
          'Description': 'Test Description',
          'Quantity': 1,
          'Unit Price': 100,
          'Total': 100,
          'Currency': 'USD',
          'Invoice Number': 'TEST-001',
          'Status': 'Test',
          'Date': new Date().toISOString().split('T')[0],
          'Created': new Date().toISOString()
        };

        const created = await base(process.env.AIRTABLE_TABLE_NAME).create([{
          fields: testData
        }]);
        
        testRecord = {
          id: created[0].id,
          fields: created[0].fields
        };
        
        console.log('Test record created successfully:', testRecord);
        
        // Clean up - delete the test record
        await base(process.env.AIRTABLE_TABLE_NAME).destroy(created[0].id);
        console.log('Test record deleted');
        
      } catch (error) {
        createError = {
          message: error.message,
          code: error.code,
          status: error.status,
          response: error.response?.data
        };
        console.error('Error creating test record:', createError);
      }
    }

    return res.json({
      success: true,
      config,
      tables: tables.map(t => t.name),
      tableInfo,
      tableError,
      testRecord,
      createError,
      message: 'Airtable connection test completed'
    });

  } catch (error) {
    console.error('Error in Airtable test:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      config: {
        hasAirtable: !!Airtable,
        hasApiKey: !!process.env.AIRTABLE_API_KEY,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID,
        hasTableName: !!process.env.AIRTABLE_TABLE_NAME,
        baseId: process.env.AIRTABLE_BASE_ID,
        tableName: process.env.AIRTABLE_TABLE_NAME
      }
    });
  }
};
