// Simple Airtable connection test without dotenv
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

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.log('\n❌ Missing required environment variables');
  console.log('\n📝 To fix this, you need to set these in Vercel:');
  console.log('1. AIRTABLE_API_KEY - Get from: https://airtable.com/account');
  console.log('2. AIRTABLE_BASE_ID - Get from your Airtable base URL');
  console.log('3. AIRTABLE_TABLE_NAME - Usually "Invoices"');
  console.log('\n🔗 Set these at: https://vercel.com/dashboard → Your Project → Settings → Environment Variables');
} else {
  console.log('\n✅ Environment variables are set locally!');
  console.log('🔗 Make sure these are also set in Vercel Dashboard');
}
