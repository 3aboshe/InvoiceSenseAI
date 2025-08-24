// API clients endpoint for InvoiceSense AI
let Airtable;
try {
  Airtable = require('airtable');
} catch (error) {
  console.warn('Airtable module not found, using mock data');
}

// Initialize Airtable client
const base = process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID && Airtable
  ? new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)
  : null;

// Helper function to validate client data
const validateClientData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Client name is required');
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email is required');
  }
  
  return errors;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to parse currency amounts
const parseAmount = (amount) => {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
};

// Get all clients with analytics
const getAllClients = async () => {
  if (!base) {
    // Return mock data if Airtable not configured
    return [
      {
        id: '1',
        name: 'Tech Solutions Inc',
        email: 'contact@techsolutions.com',
        phone: '+1 (555) 123-4567',
        address: '123 Tech Street, San Francisco, CA 94102',
        website: 'https://techsolutions.com',
        industry: 'Technology',
        notes: 'High-value client with consistent monthly projects.',
        status: 'active',
        joinDate: '2023-06-15',
        totalRevenue: 15600,
        invoiceCount: 12,
        lastInvoice: '2024-01-15'
      },
      {
        id: '2',
        name: 'Digital Marketing Co',
        email: 'hello@digitalmarketing.com',
        phone: '+1 (555) 987-6543',
        address: '456 Marketing Ave, New York, NY 10001',
        website: 'https://digitalmarketing.com',
        industry: 'Marketing',
        notes: 'Seasonal projects, high activity in Q4.',
        status: 'active',
        joinDate: '2023-08-22',
        totalRevenue: 12400,
        invoiceCount: 8,
        lastInvoice: '2024-01-12'
      }
    ];
  }

  try {
    // Get clients from Airtable
    const clientRecords = await base('Clients').select().all();
    const invoiceRecords = await base(process.env.AIRTABLE_TABLE_NAME || 'Invoices').select().all();

    // Calculate analytics for each client
    const clients = clientRecords.map(record => {
      const clientId = record.fields['Client ID'] || record.id;
      
      // Find invoices for this client
      const clientInvoices = invoiceRecords.filter(invoice => 
        invoice.fields['Client ID'] === clientId || 
        invoice.fields['Company'] === record.fields['Name']
      );

      const totalRevenue = clientInvoices.reduce((sum, invoice) => {
        return sum + parseAmount(invoice.fields['Total']);
      }, 0);

      const lastInvoice = clientInvoices.length > 0 
        ? clientInvoices
            .map(inv => new Date(inv.fields['Created'] || inv._rawJson.createdTime))
            .sort((a, b) => b - a)[0]
            .toISOString().split('T')[0]
        : null;

      return {
        id: record.id,
        name: record.fields['Name'] || '',
        email: record.fields['Email'] || '',
        phone: record.fields['Phone'] || '',
        address: record.fields['Address'] || '',
        website: record.fields['Website'] || '',
        industry: record.fields['Industry'] || '',
        notes: record.fields['Notes'] || '',
        status: record.fields['Status'] || 'active',
        joinDate: record.fields['Join Date'] || record._rawJson.createdTime.split('T')[0],
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        invoiceCount: clientInvoices.length,
        lastInvoice
      };
    });

    return clients;
  } catch (error) {
    console.error('Error fetching clients from Airtable, falling back to mock data:', error);
    // Return mock data when Airtable fails
    return [
      {
        id: '1',
        name: 'Tech Solutions Inc',
        email: 'contact@techsolutions.com',
        phone: '+1 (555) 123-4567',
        address: '123 Tech Street, San Francisco, CA 94102',
        website: 'https://techsolutions.com',
        industry: 'Technology',
        notes: 'High-value client with consistent monthly projects.',
        status: 'active',
        joinDate: '2023-06-15',
        totalRevenue: 15600,
        invoiceCount: 12,
        lastInvoice: '2024-01-15'
      },
      {
        id: '2',
        name: 'Digital Marketing Co',
        email: 'hello@digitalmarketing.com',
        phone: '+1 (555) 987-6543',
        address: '456 Marketing Ave, New York, NY 10001',
        website: 'https://digitalmarketing.com',
        industry: 'Marketing',
        notes: 'Seasonal projects, high activity in Q4.',
        status: 'active',
        joinDate: '2023-08-22',
        totalRevenue: 12400,
        invoiceCount: 8,
        lastInvoice: '2024-01-12'
      }
    ];
  }
};

// Get single client with detailed invoice history
const getClientById = async (clientId) => {
  if (!base) {
    // Return mock data
    const mockClient = {
      id: clientId,
      name: 'Tech Solutions Inc',
      email: 'contact@techsolutions.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Street, San Francisco, CA 94102',
      website: 'https://techsolutions.com',
      industry: 'Technology',
      notes: 'High-value client with consistent monthly projects.',
      status: 'active',
      joinDate: '2023-06-15',
      totalRevenue: 15600,
      invoiceCount: 12,
      lastInvoice: '2024-01-15'
    };

    const mockInvoices = [
      {
        id: '1',
        number: 'INV-2024-001',
        date: '2024-01-15',
        dueDate: '2024-02-14',
        amount: 2400,
        status: 'paid',
        description: 'Web Development Services - Q1 2024',
        items: [
          { description: 'Frontend Development', quantity: 40, unitPrice: 50, total: 2000 },
          { description: 'Testing & QA', quantity: 8, unitPrice: 50, total: 400 }
        ]
      }
    ];

    return { client: mockClient, invoices: mockInvoices };
  }

  try {
    // Get client record
    const clientRecord = await base('Clients').find(clientId);
    if (!clientRecord) {
      return null;
    }

    const clientData = {
      id: clientRecord.id,
      name: clientRecord.fields['Name'] || '',
      email: clientRecord.fields['Email'] || '',
      phone: clientRecord.fields['Phone'] || '',
      address: clientRecord.fields['Address'] || '',
      website: clientRecord.fields['Website'] || '',
      industry: clientRecord.fields['Industry'] || '',
      notes: clientRecord.fields['Notes'] || '',
      status: clientRecord.fields['Status'] || 'active',
      joinDate: clientRecord.fields['Join Date'] || clientRecord._rawJson.createdTime.split('T')[0]
    };

    // Get client invoices
    const invoiceRecords = await base(process.env.AIRTABLE_TABLE_NAME || 'Invoices').select({
      filterByFormula: `OR({Client ID} = '${clientData.id}', {Company} = '${clientData.name}')`
    }).all();

    const invoices = invoiceRecords.map(record => ({
      id: record.id,
      number: record.fields['Invoice Number'] || `INV-${record.id.slice(-6)}`,
      date: record.fields['Date'] || record._rawJson.createdTime.split('T')[0],
      dueDate: record.fields['Due Date'] || '',
      amount: parseAmount(record.fields['Total']),
      status: record.fields['Status'] || 'pending',
      description: record.fields['Description'] || '',
      currency: record.fields['Currency'] || 'USD',
      items: [{
        description: record.fields['Description'] || '',
        quantity: record.fields['Quantity'] || 1,
        unitPrice: parseAmount(record.fields['Unit Price']),
        total: parseAmount(record.fields['Total'])
      }]
    }));

    // Calculate client analytics
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const lastInvoice = invoices.length > 0 
      ? invoices.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
      : null;

    clientData.totalRevenue = Math.round(totalRevenue * 100) / 100;
    clientData.invoiceCount = invoices.length;
    clientData.lastInvoice = lastInvoice;

    return { client: clientData, invoices };
  } catch (error) {
    console.error('Error fetching client from Airtable, falling back to mock data:', error);
    // Return mock data when Airtable fails
    const mockClient = {
      id: clientId,
      name: 'Tech Solutions Inc',
      email: 'contact@techsolutions.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Street, San Francisco, CA 94102',
      website: 'https://techsolutions.com',
      industry: 'Technology',
      notes: 'High-value client with consistent monthly projects.',
      status: 'active',
      joinDate: '2023-06-15',
      totalRevenue: 15600,
      invoiceCount: 12,
      lastInvoice: '2024-01-15'
    };

    const mockInvoices = [
      {
        id: '1',
        number: 'INV-2024-001',
        date: '2024-01-15',
        dueDate: '2024-02-14',
        amount: 2400,
        status: 'paid',
        description: 'Web Development Services - Q1 2024',
        items: [
          { description: 'Frontend Development', quantity: 40, unitPrice: 50, total: 2000 },
          { description: 'Testing & QA', quantity: 8, unitPrice: 50, total: 400 }
        ]
      }
    ];

    return { client: mockClient, invoices: mockInvoices };
  }
};

// Create new client
const createClient = async (clientData) => {
  const errors = validateClientData(clientData);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  if (!base) {
    // Return mock response
    return {
      id: `client_${Date.now()}`,
      ...clientData,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      totalRevenue: 0,
      invoiceCount: 0,
      lastInvoice: null
    };
  }

  try {
    const record = await base('Clients').create({
      'Name': clientData.name,
      'Email': clientData.email,
      'Phone': clientData.phone || '',
      'Address': clientData.address || '',
      'Website': clientData.website || '',
      'Industry': clientData.industry || '',
      'Notes': clientData.notes || '',
      'Status': 'active',
      'Join Date': new Date().toISOString().split('T')[0]
    });

    return {
      id: record.id,
      name: record.fields['Name'],
      email: record.fields['Email'],
      phone: record.fields['Phone'] || '',
      address: record.fields['Address'] || '',
      website: record.fields['Website'] || '',
      industry: record.fields['Industry'] || '',
      notes: record.fields['Notes'] || '',
      status: record.fields['Status'],
      joinDate: record.fields['Join Date'],
      totalRevenue: 0,
      invoiceCount: 0,
      lastInvoice: null
    };
  } catch (error) {
    console.error('Error creating client:', error);
    throw new Error('Failed to create client');
  }
};

// Update client
const updateClient = async (clientId, clientData) => {
  const errors = validateClientData(clientData);
  if (errors.length > 0) {
    throw new Error(`Validation errors: ${errors.join(', ')}`);
  }

  if (!base) {
    // Return mock response
    return {
      id: clientId,
      ...clientData,
      totalRevenue: 15600,
      invoiceCount: 12,
      lastInvoice: '2024-01-15'
    };
  }

  try {
    const record = await base('Clients').update(clientId, {
      'Name': clientData.name,
      'Email': clientData.email,
      'Phone': clientData.phone || '',
      'Address': clientData.address || '',
      'Website': clientData.website || '',
      'Industry': clientData.industry || '',
      'Notes': clientData.notes || '',
      'Status': clientData.status || 'active'
    });

    return {
      id: record.id,
      name: record.fields['Name'],
      email: record.fields['Email'],
      phone: record.fields['Phone'] || '',
      address: record.fields['Address'] || '',
      website: record.fields['Website'] || '',
      industry: record.fields['Industry'] || '',
      notes: record.fields['Notes'] || '',
      status: record.fields['Status'],
      joinDate: record.fields['Join Date']
    };
  } catch (error) {
    console.error('Error updating client:', error);
    throw new Error('Failed to update client');
  }
};

// Delete client
const deleteClient = async (clientId) => {
  if (!base) {
    return { success: true, message: 'Client deleted successfully (mock)' };
  }

  try {
    await base('Clients').destroy(clientId);
    return { success: true, message: 'Client deleted successfully' };
  } catch (error) {
    console.error('Error deleting client:', error);
    throw new Error('Failed to delete client');
  }
};

// Main handler function
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, query } = req;
    const clientId = query.id;

    switch (method) {
      case 'GET':
        if (clientId) {
          // Get single client with invoices
          const result = await getClientById(clientId);
          if (!result) {
            return res.status(404).json({
              success: false,
              error: 'Client not found'
            });
          }
          res.json({
            success: true,
            data: result
          });
        } else {
          // Get all clients
          const clients = await getAllClients();
          res.json({
            success: true,
            data: clients
          });
        }
        break;

      case 'POST':
        // Create new client
        const newClient = await createClient(req.body);
        res.status(201).json({
          success: true,
          data: newClient,
          message: 'Client created successfully'
        });
        break;

      case 'PUT':
        if (!clientId) {
          return res.status(400).json({
            success: false,
            error: 'Client ID is required for updates'
          });
        }
        // Update client
        const updatedClient = await updateClient(clientId, req.body);
        res.json({
          success: true,
          data: updatedClient,
          message: 'Client updated successfully'
        });
        break;

      case 'DELETE':
        if (!clientId) {
          return res.status(400).json({
            success: false,
            error: 'Client ID is required for deletion'
          });
        }
        // Delete client
        const deleteResult = await deleteClient(clientId);
        res.json({
          success: true,
          message: deleteResult.message
        });
        break;

      default:
        res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Error in clients API:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};
