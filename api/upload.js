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
              text: `You are an EXPERT invoice reader with 20+ years of experience in document processing, OCR, and financial data extraction. You can read ANY type of invoice including:

CRITICAL CAPABILITIES:
- Handwritten invoices (cursive, print, messy handwriting)
- Printed invoices (any font, size, orientation)
- Scanned documents (low quality, blurry, rotated)
- Digital invoices (PDFs, screenshots, photos)
- Multi-language invoices (Arabic, English, numbers in any format)
- Damaged or partially visible invoices
- Invoices with complex layouts, tables, and formatting

EXTRACTION REQUIREMENTS:
1. Read EVERY single character, number, and symbol visible
2. Preserve exact formatting and layout structure
3. Handle currency symbols (USD, IQD, د.ع, $, €, £, etc.)
4. Recognize handwritten numbers and text accurately
5. Extract dates in any format (DD/MM/YYYY, MM-DD-YY, etc.)
6. Identify company names, addresses, phone numbers, emails
7. Capture all line items with descriptions, quantities, prices
8. Read totals, subtotals, taxes, discounts, shipping costs
9. Handle mathematical calculations and currency conversions
10. Preserve invoice numbers, reference numbers, PO numbers

SPECIAL INSTRUCTIONS:
- If text is unclear, make your best educated guess based on context
- For handwritten text, use context clues to improve accuracy
- Maintain original spelling even if it appears incorrect
- Include ALL visible text, even if it seems irrelevant
- Preserve decimal places and number formatting exactly
- Handle both Arabic and English text seamlessly
- Recognize common invoice terms in multiple languages

OUTPUT FORMAT:
Provide a COMPLETE, VERBATIM transcription of ALL text visible in the invoice image. Include:
- Header information (company details, contact info)
- Invoice metadata (number, date, due date, terms)
- Customer/client information
- Line items with full descriptions
- All numerical values (quantities, prices, totals)
- Footer information (terms, notes, signatures)
- Any handwritten notes or additions

Be EXTREMELY thorough - leave nothing out. Your accuracy is critical for financial data processing.`
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
          content: `You are a MASTER invoice data analyst with expertise in financial document processing, OCR, and data extraction. Your task is to analyze the following invoice text and extract structured data with EXTREME accuracy.

CRITICAL EXTRACTION CAPABILITIES:
- Handle handwritten and printed text seamlessly
- Recognize numbers in any format (1,234.56, ١٢٣٤٫٥٦, etc.)
- Process multi-language content (Arabic, English, mixed)
- Extract from complex layouts and tables
- Handle damaged or unclear text with context clues
- Recognize various currency formats and symbols
- Process mathematical calculations and totals

REQUIRED JSON STRUCTURE:
{
  "client_id": "extracted client ID, customer number, or account number",
  "company": "extracted company/vendor/business name",
  "line_items": [
    {
      "description": "complete item description or service name",
      "quantity": "quantity as number (handle fractions, decimals)",
      "unit_price": "unit price as number (handle currency symbols)",
      "amount": "total amount for this line item as number",
      "currency": "currency code (USD, IQD, د.ع, $, etc.)"
    }
  ]
}

EXTRACTION RULES:
1. CLIENT_ID: Look for customer ID, account number, client number, reference number, or any unique identifier
2. COMPANY: Extract the vendor/supplier/company name issuing the invoice
3. LINE_ITEMS: Extract EVERY line item with complete details
4. QUANTITY: Convert to numeric value (handle "1", "1.5", "2.25", etc.)
5. UNIT_PRICE: Extract per-unit cost as numeric value
6. AMOUNT: Calculate or extract total for each line item
7. CURRENCY: Identify currency from symbols, text, or context

SPECIAL HANDLING:
- For handwritten text: Use context and common patterns to improve accuracy
- For unclear numbers: Make educated guesses based on totals and context
- For missing data: Use "N/A" or reasonable defaults
- For currency: Default to "USD" if unclear, but prefer detected currency
- For calculations: Verify math and correct obvious errors
- For descriptions: Preserve original text even if unclear

QUALITY REQUIREMENTS:
- Be EXTREMELY thorough - extract every possible line item
- Maintain accuracy for financial calculations
- Handle edge cases and unusual formats
- Preserve original data integrity
- Return ONLY valid JSON - no additional text or explanations

Invoice text to analyze:
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
        'Total': item.amount || item.total
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
