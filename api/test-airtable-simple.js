// Simple Airtable connection test
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
    console.log('Testing simple Airtable connection...');
    
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

    // Test 1: Try to access the specific table directly
    console.log('Testing direct table access...');
    let tableTest = null;
    let tableError = null;
    
    if (process.env.AIRTABLE_TABLE_NAME) {
      try {
        const table = base(process.env.AIRTABLE_TABLE_NAME);
        
        // Try to get table metadata
        const records = await table.select({ maxRecords: 1 }).firstPage();
        
        tableTest = {
          name: process.env.AIRTABLE_TABLE_NAME,
          recordCount: records.length,
          accessible: true
        };
        
        console.log('Table access successful:', tableTest);
        
        // Test 2: Try to create a simple test record
        console.log('Testing simple record creation...');
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

        const created = await table.create([{
          fields: testData
        }]);
        
        console.log('Test record created successfully:', created[0].id);
        
        // Clean up - delete the test record
        await table.destroy(created[0].id);
        console.log('Test record deleted');
        
        tableTest.testRecordCreated = true;
        tableTest.testRecordId = created[0].id;
        
      } catch (error) {
        tableError = {
          message: error.message,
          code: error.code,
          status: error.status,
          response: error.response?.data
        };
        console.error('Error accessing table:', tableError);
      }
    }

    return res.json({
      success: true,
      config,
      tableTest,
      tableError,
      message: 'Simple Airtable connection test completed'
    });

  } catch (error) {
    console.error('Error in simple Airtable test:', error);
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
