const multer = require('multer');
const { Groq } = require('groq-sdk');
const Airtable = require('airtable');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Airtable client
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Helper function to convert buffer to base64
const bufferToBase64 = (buffer) => {
  return buffer.toString('base64');
};

// Helper function to extract text from image using Groq
const extractTextFromImage = async (base64Image) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Transcribe all text from this invoice image verbatim. Include line items, totals, company names, dates, and any other text present. The output should be a raw text dump."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 4096,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw new Error('Failed to extract text from image');
  }
};

// Helper function to structure text into JSON using Groq
const structureTextToJSON = async (rawText) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Based on the following text from an invoice, extract the Client ID, Company name, and all line items. Structure your response as a single, clean JSON object. Each line item in the invoice should be an object in a "line_items" array. The JSON format must be exactly: {"client_id": "...", "company": "...", "line_items": [{"description": "...", "quantity": ..., "unit_price": ..., "total": ...}]}. Return only the JSON object and nothing else.

Invoice text:
${rawText}`
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid JSON response from AI');
  } catch (error) {
    console.error('Error structuring text to JSON:', error);
    throw new Error('Failed to structure invoice data');
  }
};

// Helper function to save data to Airtable
const saveToAirtable = async (parsedData) => {
  try {
    const { client_id, company, line_items } = parsedData;
    
    // Create records for each line item
    const records = line_items.map(item => ({
      fields: {
        'Client ID': client_id,
        'Company': company,
        'Description': item.description,
        'Quantity': item.quantity,
        'Unit Price': item.unit_price,
        'Total': item.total
      }
    }));

    // Insert records into Airtable
    const createdRecords = await base(process.env.AIRTABLE_TABLE_NAME).create(records);
    
    return createdRecords;
  } catch (error) {
    console.error('Error saving to Airtable:', error);
    throw new Error('Failed to save data to Airtable');
  }
};

// Vercel serverless function
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Check if API keys are configured
    if (!process.env.GROQ_API_KEY || !process.env.AIRTABLE_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'API keys not configured. Please set up GROQ_API_KEY, AIRTABLE_API_KEY, AIRTABLE_BASE_ID, and AIRTABLE_TABLE_NAME in your environment variables.',
        demo: true
      });
    }

    // Handle file upload
    const uploadMiddleware = upload.single('image');
    
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          error: err.message 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'No image file provided' 
        });
      }

      try {
        console.log('Processing uploaded image...');

        // Step 1: Convert image buffer to base64
        const base64Image = bufferToBase64(req.file.buffer);
        console.log('Image converted to base64');

        // Step 2: Extract text from image using Groq
        console.log('Extracting text from image...');
        const rawText = await extractTextFromImage(base64Image);
        console.log('Text extraction completed');

        // Step 3: Structure text into JSON using Groq
        console.log('Structuring text into JSON...');
        const parsedData = await structureTextToJSON(rawText);
        console.log('JSON structuring completed');

        // Step 4: Save data to Airtable (optional)
        let savedRecords = null;
        let airtableMessage = '';
        
        try {
          console.log('Saving data to Airtable...');
          savedRecords = await saveToAirtable(parsedData);
          console.log('Data saved to Airtable successfully');
          airtableMessage = ` and saved ${savedRecords.length} line items to Airtable`;
        } catch (airtableError) {
          console.warn('Airtable save failed, but continuing with data extraction:', airtableError.message);
          airtableMessage = ' (Airtable save failed - check your table configuration)';
        }

        // Step 5: Send success response
        res.json({
          success: true,
          data: parsedData,
          message: `Successfully processed invoice${airtableMessage}`,
          airtableSuccess: !!savedRecords
        });

      } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({
          success: false,
          error: error.message || 'An error occurred while processing the invoice'
        });
      }
    });

  } catch (error) {
    console.error('Unhandled error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
