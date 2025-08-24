const express = require('express');
const Airtable = require('airtable');

const router = express.Router();

// Initialize Airtable client
const base = process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID 
  ? new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID)
  : null;

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

// Helper function to parse currency amounts
const parseAmount = (amount) => {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') {
    // Remove currency symbols and parse
    const cleaned = amount.replace(/[^\d.-]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
};

// Get all invoice data from Airtable
const getInvoiceData = async () => {
  if (!base) {
    throw new Error('Airtable not configured');
  }

  try {
    const records = await base(process.env.AIRTABLE_TABLE_NAME || 'Invoices').select({
      sort: [{ field: 'Created', direction: 'desc' }]
    }).all();

    return records.map(record => ({
      id: record.id,
      clientId: record.fields['Client ID'],
      company: record.fields['Company'],
      description: record.fields['Description'],
      quantity: record.fields['Quantity'] || 0,
      unitPrice: parseAmount(record.fields['Unit Price']),
      total: parseAmount(record.fields['Total']),
      created: record.fields['Created'] || record._rawJson.createdTime,
      currency: record.fields['Currency'] || 'USD'
    }));
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    throw new Error('Failed to fetch invoice data');
  }
};

// Calculate KPIs
const calculateKPIs = (invoices, dateRange) => {
  const { start, end } = dateRange;
  
  const filteredInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.created);
    return invoiceDate >= start && invoiceDate <= end;
  });

  const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalInvoices = filteredInvoices.length;
  const uniqueClients = new Set(filteredInvoices.map(invoice => invoice.clientId)).size;
  
  // Calculate previous period for growth
  const periodDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const prevStart = new Date(start);
  prevStart.setDate(start.getDate() - periodDays);
  
  const prevInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.created);
    return invoiceDate >= prevStart && invoiceDate < start;
  });

  const prevRevenue = prevInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const prevInvoiceCount = prevInvoices.length;
  const prevClientCount = new Set(prevInvoices.map(invoice => invoice.clientId)).size;

  const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const invoiceGrowth = prevInvoiceCount > 0 ? ((totalInvoices - prevInvoiceCount) / prevInvoiceCount) * 100 : 0;
  const clientGrowth = prevClientCount > 0 ? ((uniqueClients - prevClientCount) / prevClientCount) * 100 : 0;

  return {
    totalRevenue,
    totalInvoices,
    totalClients: uniqueClients,
    successRate: 98.5, // Mock - would calculate from processing logs
    avgProcessingTime: 12.3, // Mock - would calculate from processing logs
    revenueGrowth: Math.round(revenueGrowth * 100) / 100,
    invoiceGrowth: Math.round(invoiceGrowth * 100) / 100,
    clientGrowth: Math.round(clientGrowth * 100) / 100
  };
};

// Generate revenue trend data
const generateRevenueTrend = (invoices, dateRange) => {
  const { start, end } = dateRange;
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  const trendData = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    const dayInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.created);
      return invoiceDate.toDateString() === date.toDateString();
    });
    
    const revenue = dayInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const invoiceCount = dayInvoices.length;
    
    trendData.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(revenue * 100) / 100,
      invoices: invoiceCount
    });
  }
  
  return trendData;
};

// Get top clients
const getTopClients = (invoices, limit = 5) => {
  const clientData = {};
  
  invoices.forEach(invoice => {
    if (!clientData[invoice.company]) {
      clientData[invoice.company] = {
        name: invoice.company,
        revenue: 0,
        invoices: 0
      };
    }
    clientData[invoice.company].revenue += invoice.total;
    clientData[invoice.company].invoices += 1;
  });
  
  return Object.values(clientData)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map(client => ({
      ...client,
      revenue: Math.round(client.revenue * 100) / 100
    }));
};

// Analytics endpoint
router.get('/', async (req, res) => {
  try {
    // Check if Airtable is configured
    if (!base) {
      // Return mock data if Airtable not configured
      const mockData = {
        kpis: {
          totalRevenue: 45678.90,
          totalInvoices: 234,
          totalClients: 45,
          successRate: 98.5,
          avgProcessingTime: 12.3,
          revenueGrowth: 15.2,
          invoiceGrowth: 8.7,
          clientGrowth: 12.1
        },
        revenueData: [
          { date: '2024-01-01', revenue: 3200, invoices: 12 },
          { date: '2024-01-02', revenue: 4100, invoices: 15 },
          { date: '2024-01-03', revenue: 2800, invoices: 9 },
          { date: '2024-01-04', revenue: 5200, invoices: 18 },
          { date: '2024-01-05', revenue: 3900, invoices: 14 },
          { date: '2024-01-06', revenue: 4700, invoices: 16 },
          { date: '2024-01-07', revenue: 5800, invoices: 21 }
        ],
        topClients: [
          { name: 'Tech Solutions Inc', revenue: 8900, invoices: 12 },
          { name: 'Digital Marketing Co', revenue: 7600, invoices: 8 },
          { name: 'Creative Agency', revenue: 6800, invoices: 15 },
          { name: 'Consulting Group', revenue: 5400, invoices: 6 },
          { name: 'Software Company', revenue: 4900, invoices: 9 }
        ],
        currencyDistribution: [
          { name: 'USD', value: 65, amount: 29690.79 },
          { name: 'IQD', value: 35, amount: 15988.11 }
        ],
        invoiceCategories: [
          { category: 'Web Development', count: 45, revenue: 15600 },
          { category: 'Design Services', count: 32, revenue: 12400 },
          { category: 'Consulting', count: 28, revenue: 9800 },
          { category: 'Marketing', count: 21, revenue: 7900 }
        ],
        recentActivity: [
          { id: 1, type: 'invoice', client: 'Tech Solutions Inc', amount: 1200, time: '2 hours ago' },
          { id: 2, type: 'client', client: 'New Client Added', amount: null, time: '4 hours ago' },
          { id: 3, type: 'invoice', client: 'Digital Marketing Co', amount: 850, time: '6 hours ago' },
          { id: 4, type: 'invoice', client: 'Creative Agency', amount: 2100, time: '1 day ago' }
        ]
      };

      return res.json({
        success: true,
        data: mockData,
        message: 'Mock analytics data (Airtable not configured)',
        mock: true
      });
    }

    const timeRange = req.query.range || '30d';
    const dateRange = getDateRange(timeRange);

    // Fetch all invoice data
    const invoices = await getInvoiceData();

    // Calculate analytics
    const kpis = calculateKPIs(invoices, dateRange);
    const revenueData = generateRevenueTrend(invoices, dateRange);
    const topClients = getTopClients(invoices);

    const analyticsData = {
      kpis,
      revenueData,
      topClients,
      timeRange,
      generated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analyticsData,
      message: 'Analytics data generated successfully'
    });

  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate analytics'
    });
  }
});

module.exports = router;
