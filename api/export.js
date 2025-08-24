const Airtable = require('airtable');

// Initialize Airtable client
const base = process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID 
  ? new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)
  : null;

// Helper function to parse currency amounts
const parseAmount = (amount) => {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
};

// Helper function to get date range
const getDateRange = (range) => {
  const now = new Date();
  const start = new Date();
  
  switch (range) {
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }
  
  return { start, end: now };
};

// Generate CSV content for invoices
const generateInvoicesCSV = async (dateRange) => {
  if (!base) {
    // Return mock CSV data
    const mockData = [
      ['Invoice ID', 'Client ID', 'Company', 'Description', 'Quantity', 'Unit Price', 'Total', 'Currency', 'Date', 'Status'],
      ['INV-001', 'CLIENT-001', 'Tech Solutions Inc', 'Web Development', '40', '75.00', '3000.00', 'USD', '2024-01-15', 'Paid'],
      ['INV-002', 'CLIENT-002', 'Digital Marketing Co', 'UI/UX Design', '20', '100.00', '2000.00', 'USD', '2024-01-12', 'Paid'],
      ['INV-003', 'CLIENT-001', 'Tech Solutions Inc', 'Backend Development', '32', '85.00', '2720.00', 'USD', '2024-01-10', 'Pending']
    ];
    return mockData.map(row => row.join(',')).join('\n');
  }

  try {
    const { start, end } = dateRange;
    const records = await base(process.env.AIRTABLE_TABLE_NAME || 'Invoices').select({
      filterByFormula: `AND(IS_AFTER({Created}, '${start.toISOString()}'), IS_BEFORE({Created}, '${end.toISOString()}'))`
    }).all();

    const csvData = [
      ['Invoice ID', 'Client ID', 'Company', 'Description', 'Quantity', 'Unit Price', 'Total', 'Currency', 'Date', 'Status']
    ];

    records.forEach(record => {
      csvData.push([
        record.id,
        record.fields['Client ID'] || '',
        record.fields['Company'] || '',
        record.fields['Description'] || '',
        record.fields['Quantity'] || '',
        parseAmount(record.fields['Unit Price']).toFixed(2),
        parseAmount(record.fields['Total']).toFixed(2),
        record.fields['Currency'] || 'USD',
        record.fields['Created'] ? new Date(record.fields['Created']).toISOString().split('T')[0] : new Date(record._rawJson.createdTime).toISOString().split('T')[0],
        record.fields['Status'] || 'Processed'
      ]);
    });

    return csvData.map(row => row.join(',')).join('\n');
  } catch (error) {
    console.error('Error generating invoices CSV:', error);
    throw new Error('Failed to generate invoices CSV');
  }
};

// Generate CSV content for clients
const generateClientsCSV = async () => {
  if (!base) {
    // Return mock CSV data
    const mockData = [
      ['Client ID', 'Name', 'Email', 'Phone', 'Address', 'Industry', 'Status', 'Join Date', 'Total Revenue', 'Invoice Count', 'Last Invoice'],
      ['CLIENT-001', 'Tech Solutions Inc', 'contact@techsolutions.com', '+1 (555) 123-4567', '123 Tech Street, San Francisco, CA', 'Technology', 'Active', '2023-06-15', '15600.00', '12', '2024-01-15'],
      ['CLIENT-002', 'Digital Marketing Co', 'hello@digitalmarketing.com', '+1 (555) 987-6543', '456 Marketing Ave, New York, NY', 'Marketing', 'Active', '2023-08-22', '12400.00', '8', '2024-01-12']
    ];
    return mockData.map(row => row.join(',')).join('\n');
  }

  try {
    const clientRecords = await base('Clients').select().all();
    const invoiceRecords = await base(process.env.AIRTABLE_TABLE_NAME || 'Invoices').select().all();

    const csvData = [
      ['Client ID', 'Name', 'Email', 'Phone', 'Address', 'Industry', 'Status', 'Join Date', 'Total Revenue', 'Invoice Count', 'Last Invoice']
    ];

    clientRecords.forEach(record => {
      const clientId = record.fields['Client ID'] || record.id;
      const clientName = record.fields['Name'] || '';
      
      // Find invoices for this client
      const clientInvoices = invoiceRecords.filter(invoice => 
        invoice.fields['Client ID'] === clientId || 
        invoice.fields['Company'] === clientName
      );

      const totalRevenue = clientInvoices.reduce((sum, invoice) => {
        return sum + parseAmount(invoice.fields['Total']);
      }, 0);

      const lastInvoice = clientInvoices.length > 0 
        ? clientInvoices
            .map(inv => new Date(inv.fields['Created'] || inv._rawJson.createdTime))
            .sort((a, b) => b - a)[0]
            .toISOString().split('T')[0]
        : '';

      csvData.push([
        record.id,
        record.fields['Name'] || '',
        record.fields['Email'] || '',
        record.fields['Phone'] || '',
        record.fields['Address'] || '',
        record.fields['Industry'] || '',
        record.fields['Status'] || 'Active',
        record.fields['Join Date'] || record._rawJson.createdTime.split('T')[0],
        totalRevenue.toFixed(2),
        clientInvoices.length.toString(),
        lastInvoice
      ]);
    });

    return csvData.map(row => row.join(',')).join('\n');
  } catch (error) {
    console.error('Error generating clients CSV:', error);
    throw new Error('Failed to generate clients CSV');
  }
};

// Generate CSV content for revenue analytics
const generateRevenueCSV = async (dateRange) => {
  if (!base) {
    // Return mock CSV data
    const mockData = [
      ['Date', 'Revenue', 'Invoice Count', 'Average Invoice Value'],
      ['2024-01-15', '3000.00', '1', '3000.00'],
      ['2024-01-14', '2400.00', '2', '1200.00'],
      ['2024-01-13', '1800.00', '1', '1800.00'],
      ['2024-01-12', '2000.00', '1', '2000.00'],
      ['2024-01-11', '1500.00', '3', '500.00']
    ];
    return mockData.map(row => row.join(',')).join('\n');
  }

  try {
    const { start, end } = dateRange;
    const records = await base(process.env.AIRTABLE_TABLE_NAME || 'Invoices').select({
      filterByFormula: `AND(IS_AFTER({Created}, '${start.toISOString()}'), IS_BEFORE({Created}, '${end.toISOString()}'))`
    }).all();

    // Group by date
    const dailyData = {};
    
    records.forEach(record => {
      const date = record.fields['Created'] 
        ? new Date(record.fields['Created']).toISOString().split('T')[0]
        : new Date(record._rawJson.createdTime).toISOString().split('T')[0];
      
      if (!dailyData[date]) {
        dailyData[date] = {
          revenue: 0,
          count: 0
        };
      }
      
      dailyData[date].revenue += parseAmount(record.fields['Total']);
      dailyData[date].count += 1;
    });

    const csvData = [
      ['Date', 'Revenue', 'Invoice Count', 'Average Invoice Value']
    ];

    Object.entries(dailyData)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .forEach(([date, data]) => {
        const avgValue = data.count > 0 ? data.revenue / data.count : 0;
        csvData.push([
          date,
          data.revenue.toFixed(2),
          data.count.toString(),
          avgValue.toFixed(2)
        ]);
      });

    return csvData.map(row => row.join(',')).join('\n');
  } catch (error) {
    console.error('Error generating revenue CSV:', error);
    throw new Error('Failed to generate revenue CSV');
  }
};

// Generate CSV content for client-specific data
const generateClientDetailCSV = async (clientId) => {
  if (!base) {
    // Return mock CSV data
    const mockData = [
      ['Invoice Number', 'Date', 'Due Date', 'Description', 'Amount', 'Status', 'Currency'],
      ['INV-2024-001', '2024-01-15', '2024-02-14', 'Web Development Services - Q1 2024', '2400.00', 'Paid', 'USD'],
      ['INV-2024-002', '2024-01-08', '2024-02-07', 'UI/UX Design Services', '1800.00', 'Paid', 'USD'],
      ['INV-2023-045', '2023-12-20', '2024-01-19', 'Full-stack Development Project', '3200.00', 'Overdue', 'USD']
    ];
    return mockData.map(row => row.join(',')).join('\n');
  }

  try {
    // Get client info
    const clientRecord = await base('Clients').find(clientId);
    if (!clientRecord) {
      throw new Error('Client not found');
    }

    const clientName = clientRecord.fields['Name'];
    
    // Get client invoices
    const invoiceRecords = await base(process.env.AIRTABLE_TABLE_NAME || 'Invoices').select({
      filterByFormula: `OR({Client ID} = '${clientId}', {Company} = '${clientName}')`
    }).all();

    const csvData = [
      ['Invoice Number', 'Date', 'Due Date', 'Description', 'Amount', 'Status', 'Currency']
    ];

    invoiceRecords.forEach(record => {
      csvData.push([
        record.fields['Invoice Number'] || `INV-${record.id.slice(-6)}`,
        record.fields['Date'] || new Date(record._rawJson.createdTime).toISOString().split('T')[0],
        record.fields['Due Date'] || '',
        record.fields['Description'] || '',
        parseAmount(record.fields['Total']).toFixed(2),
        record.fields['Status'] || 'Pending',
        record.fields['Currency'] || 'USD'
      ]);
    });

    return csvData.map(row => row.join(',')).join('\n');
  } catch (error) {
    console.error('Error generating client detail CSV:', error);
    throw new Error('Failed to generate client detail CSV');
  }
};

// Main handler function
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
    const { type, range = '30d', clientId } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Export type is required. Supported types: invoices, clients, revenue, client-detail'
      });
    }

    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'invoices':
        const invoiceDateRange = getDateRange(range);
        csvContent = await generateInvoicesCSV(invoiceDateRange);
        filename = `invoices-${range}-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'clients':
        csvContent = await generateClientsCSV();
        filename = `clients-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'revenue':
        const revenueDateRange = getDateRange(range);
        csvContent = await generateRevenueCSV(revenueDateRange);
        filename = `revenue-${range}-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      case 'client-detail':
        if (!clientId) {
          return res.status(400).json({
            success: false,
            error: 'Client ID is required for client-detail export'
          });
        }
        csvContent = await generateClientDetailCSV(clientId);
        filename = `client-${clientId}-invoices-${new Date().toISOString().split('T')[0]}.csv`;
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid export type. Supported types: invoices, clients, revenue, client-detail'
        });
    }

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    res.status(200).send(csvContent);

  } catch (error) {
    console.error('Error in export API:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate export'
    });
  }
};
