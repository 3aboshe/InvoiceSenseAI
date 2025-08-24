const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');
const Airtable = require('airtable');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Check for required environment variables
const requiredEnvVars = ['GROQ_API_KEY', 'AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️  Warning: Missing environment variables:', missingEnvVars.join(', '));
  console.warn('📝 Please create a .env file with the required API keys');
  console.warn('🔑 The app will run in demo mode without AI processing');
} else {
  console.log('✅ All required environment variables are configured');
}

// Initialize Groq client (only if API key is available)
let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

// Initialize Airtable client (only if API keys are available)
let base = null;
if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
  base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
}

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
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

// Helper function to extract text from image using Groq LLaVA
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

// Helper function to structure text into JSON using Groq Llama 3
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
    
    console.log('Attempting to save to Airtable table:', process.env.AIRTABLE_TABLE_NAME);
    console.log('Data to save:', { client_id, company, lineItemsCount: line_items.length });
    
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

    console.log('Records to create:', records);

    // Insert records into Airtable
    const createdRecords = await base(process.env.AIRTABLE_TABLE_NAME).create(records);
    
    console.log('Successfully created records:', createdRecords.length);
    return createdRecords;
  } catch (error) {
    console.error('Error saving to Airtable:', error);
    console.error('Table name being used:', process.env.AIRTABLE_TABLE_NAME);
    
    // If it's a field name error, provide helpful information
    if (error.error === 'UNKNOWN_FIELD_NAME') {
      throw new Error(`Airtable field name error: ${error.message}. Please check your Airtable table field names.`);
    }
    
    throw new Error('Failed to save data to Airtable');
  }
};

// Main upload endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image file provided' 
      });
    }

    // Check if API keys are configured
    if (!groq || !base) {
      return res.status(503).json({
        success: false,
        error: 'API keys not configured. Please set up GROQ_API_KEY, AIRTABLE_API_KEY, AIRTABLE_BASE_ID, and AIRTABLE_TABLE_NAME in your .env file.',
        demo: true
      });
    }

    console.log('Processing uploaded image...');

    // Step 1: Convert image buffer to base64
    const base64Image = bufferToBase64(req.file.buffer);
    console.log('Image converted to base64');

    // Step 2: Extract text from image using LLaVA
    console.log('Extracting text from image...');
    const rawText = await extractTextFromImage(base64Image);
    console.log('Text extraction completed');

    // Step 3: Structure text into JSON using Llama 3
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGroq = !!(process.env.GROQ_API_KEY && groq);
  const hasAirtable = !!(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID && base);
  const apiConfigured = hasGroq && hasAirtable;
  
  res.json({ 
    success: true, 
    message: 'Invoice Extractor Server is running',
    timestamp: new Date().toISOString(),
    apiConfigured: apiConfigured,
    groqConfigured: hasGroq,
    airtableConfigured: hasAirtable,
    missingVars: missingEnvVars
  });
});

// Demo endpoint for testing without API keys
app.post('/api/demo', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false, 
      error: 'No image file provided' 
    });
  }

  // Return sample data for demo purposes
  const demoData = {
    client_id: "DEMO-001",
    company: "Sample Company Inc.",
    line_items: [
      {
        description: "Web Development Services",
        quantity: 40,
        unit_price: 75.00,
        total: 3000.00
      },
      {
        description: "UI/UX Design",
        quantity: 20,
        unit_price: 100.00,
        total: 2000.00
      },
      {
        description: "Project Management",
        quantity: 10,
        unit_price: 50.00,
        total: 500.00
      }
    ]
  };

  res.json({
    success: true,
    data: demoData,
    message: "Demo data generated successfully",
    demo: true
  });
});

// Import analytics routes
const analyticsRoutes = require('./routes/analytics');

// Use analytics routes
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Invoice Extractor Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload`);
});
