const dotenv = require('dotenv');
const Airtable = require('airtable');

// Load environment variables
dotenv.config();

// Initialize Airtable client
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function testAirtable() {
  try {
    console.log('🔍 Testing Airtable connection...');
    console.log('Base ID:', process.env.AIRTABLE_BASE_ID);
    console.log('Table Name:', process.env.AIRTABLE_TABLE_NAME);
    
    // Test 1: Try to create a test record
    console.log('\n🧪 Testing record creation...');
    const table = base(process.env.AIRTABLE_TABLE_NAME);
    const testRecord = await table.create([
      {
        fields: {
          'Client ID': 'TEST-001',
          'Company': 'Test Company',
          'Description': 'Test Item',
          'Quantity': 1,
          'Unit Price': 10.00,
          'Total': 10.00
        }
      }
    ]);
    
    console.log('✅ Test record created successfully!');
    console.log('Record ID:', testRecord[0].id);
    
    // Test 2: Delete the test record
    console.log('\n🧹 Cleaning up test record...');
    await table.destroy([testRecord[0].id]);
    console.log('✅ Test record deleted successfully!');
    
    console.log('\n🎉 All Airtable tests passed! Your configuration is working correctly.');
    
  } catch (error) {
    console.error('❌ Airtable test failed:', error.message);
    
    if (error.error === 'UNKNOWN_FIELD_NAME') {
      console.error('\n🔧 Field name issue detected!');
      console.error('The error suggests that one or more field names do not exist in your table.');
      console.error('Expected field names:');
      console.error('- "Client ID"');
      console.error('- "Company"');
      console.error('- "Description"');
      console.error('- "Quantity"');
      console.error('- "Unit Price"');
      console.error('- "Total"');
      console.error('\nPlease check your Airtable table and make sure these exact field names exist.');
    }
  }
}

testAirtable();
