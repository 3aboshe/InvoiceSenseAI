export default function handler(req, res) {
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

  const hasGroq = !!(process.env.GROQ_API_KEY);
  const hasAirtable = !!(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID);
  
  res.json({ 
    success: true, 
    message: 'InvoiceSense AI Server is running',
    timestamp: new Date().toISOString(),
    apiConfigured: hasGroq && hasAirtable,
    groqConfigured: hasGroq,
    airtableConfigured: hasAirtable
  });
}
