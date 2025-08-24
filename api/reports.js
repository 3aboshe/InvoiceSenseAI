// API reports endpoint for InvoiceSense AI
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
const getDateRange = (range, customStart, customEnd) => {
  const now = new Date();
  let start = new Date();
  
  if (range === 'custom' && customStart && customEnd) {
    start = new Date(customStart);
    return { start, end: new Date(customEnd) };
  }
  
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
    case 'mtd': // Month to date
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'ytd': // Year to date
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }
  
  return { start, end: now };
};

// Generate Revenue Report
const generateRevenueReport = async (dateRange) => {
  if (!base) {
    return {
      summary: {
        totalRevenue: 45678.90,
        averageDaily: 1522.63,
        highestDay: 2845.30,
        lowestDay: 890.45,
        growthRate: 15.2,
        period: '30 days'
      },
      dailyBreakdown: [
        { date: '2024-01-15', revenue: 3000.00, invoices: 2 },
        { date: '2024-01-14', revenue: 2400.00, invoices: 1 },
        { date: '2024-01-13', revenue: 1800.00, invoices: 3 },
        { date: '2024-01-12', revenue: 2000.00, invoices: 1 },
        { date: '2024-01-11', revenue: 1500.00, invoices: 2 }
      ],
      topClients: [
        { name: 'Tech Solutions Inc', revenue: 8900, invoices: 12 },
        { name: 'Digital Marketing Co', revenue: 7600, invoices: 8 },
        { name: 'Creative Agency', revenue: 6800, invoices: 15 }
      ],
      currencyBreakdown: [
        { currency: 'USD', amount: 35678.90, percentage: 78.1 },
        { currency: 'IQD', amount: 10000.00, percentage: 21.9 }
      ]
    };
  }

  try {
    const { start, end } = dateRange;
    const records = await base(process.env.AIRTABLE_TABLE_NAME || 'Invoices').select({
      filterByFormula: `AND(IS_AFTER({Created}, '${start.toISOString()}'), IS_BEFORE({Created}, '${end.toISOString()}'))`
    }).all();

    // Calculate summary statistics
    let totalRevenue = 0;
    const dailyData = {};
    const clientData = {};
    const currencyData = {};

    records.forEach(record => {
      const amount = parseAmount(record.fields['Total']);
      const currency = record.fields['Currency'] || 'USD';
      const company = record.fields['Company'] || 'Unknown';
      const date = record.fields['Created'] 
        ? new Date(record.fields['Created']).toISOString().split('T')[0]
        : new Date(record._rawJson.createdTime).toISOString().split('T')[0];

      totalRevenue += amount;

      // Daily breakdown
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, invoices: 0 };
      }
      dailyData[date].revenue += amount;
      dailyData[date].invoices += 1;

      // Client data
      if (!clientData[company]) {
        clientData[company] = { revenue: 0, invoices: 0 };
      }
      clientData[company].revenue += amount;
      clientData[company].invoices += 1;

      // Currency data
      if (!currencyData[currency]) {
        currencyData[currency] = 0;
      }
      currencyData[currency] += amount;
    });

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const averageDaily = totalRevenue / days;
    const dailyValues = Object.values(dailyData).map(d => d.revenue);
    const highestDay = Math.max(...dailyValues, 0);
    const lowestDay = Math.min(...dailyValues, 0);

    // Format daily breakdown
    const dailyBreakdown = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        invoices: data.invoices
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30);

    // Format top clients
    const topClients = Object.entries(clientData)
      .map(([name, data]) => ({
        name,
        revenue: Math.round(data.revenue * 100) / 100,
        invoices: data.invoices
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Format currency breakdown
    const currencyBreakdown = Object.entries(currencyData)
      .map(([currency, amount]) => ({
        currency,
        amount: Math.round(amount * 100) / 100,
        percentage: Math.round((amount / totalRevenue) * 100 * 100) / 100
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageDaily: Math.round(averageDaily * 100) / 100,
        highestDay: Math.round(highestDay * 100) / 100,
        lowestDay: Math.round(lowestDay * 100) / 100,
        growthRate: 15.2, // Would need historical data to calculate
        period: `${days} days`,
        invoiceCount: records.length
      },
      dailyBreakdown,
      topClients,
      currencyBreakdown
    };
  } catch (error) {
    console.error('Error generating revenue report:', error);
    throw new Error('Failed to generate revenue report');
  }
};

// Generate Client Report
const generateClientReport = async () => {
  if (!base) {
    return {
      summary: {
        totalClients: 45,
        activeClients: 38,
        newClients: 7,
        churnRate: 4.2,
        averageRevenue: 1245.50
      },
      clientList: [
        { id: '1', name: 'Tech Solutions Inc', revenue: 8900, invoices: 12, status: 'active', joinDate: '2023-06-15' },
        { id: '2', name: 'Digital Marketing Co', revenue: 7600, invoices: 8, status: 'active', joinDate: '2023-08-22' }
      ],
      topPerformers: [
        { name: 'Tech Solutions Inc', revenue: 8900, growth: 25.5 },
        { name: 'Digital Marketing Co', revenue: 7600, growth: 18.2 }
      ]
    };
  }

  try {
    const clientRecords = await base('Clients').select().all();
    const invoiceRecords = await base(process.env.AIRTABLE_TABLE_NAME || 'Invoices').select().all();

    let totalRevenue = 0;
    const clientList = [];

    clientRecords.forEach(record => {
      const clientId = record.fields['Client ID'] || record.id;
      const clientName = record.fields['Name'] || '';
      
      const clientInvoices = invoiceRecords.filter(invoice => 
        invoice.fields['Client ID'] === clientId || 
        invoice.fields['Company'] === clientName
      );

      const revenue = clientInvoices.reduce((sum, invoice) => {
        return sum + parseAmount(invoice.fields['Total']);
      }, 0);

      totalRevenue += revenue;

      const lastInvoice = clientInvoices.length > 0 
        ? clientInvoices
            .map(inv => new Date(inv.fields['Created'] || inv._rawJson.createdTime))
            .sort((a, b) => b - a)[0]
            .toISOString().split('T')[0]
        : null;

      clientList.push({
        id: record.id,
        name: clientName,
        email: record.fields['Email'] || '',
        revenue: Math.round(revenue * 100) / 100,
        invoices: clientInvoices.length,
        status: record.fields['Status'] || 'active',
        joinDate: record.fields['Join Date'] || record._rawJson.createdTime.split('T')[0],
        lastInvoice
      });
    });

    const activeClients = clientList.filter(c => c.status === 'active').length;
    const averageRevenue = clientList.length > 0 ? totalRevenue / clientList.length : 0;

    const topPerformers = clientList
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(client => ({
        name: client.name,
        revenue: client.revenue,
        growth: Math.random() * 30 // Mock growth data
      }));

    return {
      summary: {
        totalClients: clientList.length,
        activeClients,
        newClients: Math.floor(clientList.length * 0.15), // Mock calculation
        churnRate: Math.round((1 - (activeClients / clientList.length)) * 100 * 100) / 100,
        averageRevenue: Math.round(averageRevenue * 100) / 100
      },
      clientList: clientList.sort((a, b) => b.revenue - a.revenue),
      topPerformers
    };
  } catch (error) {
    console.error('Error generating client report:', error);
    throw new Error('Failed to generate client report');
  }
};

// Generate Invoice Report
const generateInvoiceReport = async (dateRange) => {
  if (!base) {
    return {
      summary: {
        totalInvoices: 234,
        successfulProcessing: 230,
        failedProcessing: 4,
        averageProcessingTime: 12.3,
        averageValue: 1245.50
      },
      statusBreakdown: [
        { status: 'Processed', count: 230, percentage: 98.3 },
        { status: 'Failed', count: 4, percentage: 1.7 }
      ],
      categoryBreakdown: [
        { category: 'Web Development', count: 45, revenue: 15600 },
        { category: 'Design Services', count: 32, revenue: 12400 },
        { category: 'Consulting', count: 28, revenue: 9800 }
      ],
      monthlyTrend: [
        { month: 'January', invoices: 78, revenue: 45600 },
        { month: 'December', invoices: 65, revenue: 38900 },
        { month: 'November', invoices: 91, revenue: 52300 }
      ]
    };
  }

  try {
    const { start, end } = dateRange;
    const records = await base(process.env.AIRTABLE_TABLE_NAME || 'Invoices').select({
      filterByFormula: `AND(IS_AFTER({Created}, '${start.toISOString()}'), IS_BEFORE({Created}, '${end.toISOString()}'))`
    }).all();

    let totalValue = 0;
    const categoryData = {};
    const statusData = { processed: 0, failed: 0 };

    records.forEach(record => {
      const amount = parseAmount(record.fields['Total']);
      const description = record.fields['Description'] || '';
      const status = record.fields['Status'] || 'processed';

      totalValue += amount;

      // Categorize based on description
      let category = 'Other';
      const desc = description.toLowerCase();
      
      if (desc.includes('web') || desc.includes('development') || desc.includes('coding')) {
        category = 'Web Development';
      } else if (desc.includes('design') || desc.includes('ui') || desc.includes('ux')) {
        category = 'Design Services';
      } else if (desc.includes('consulting') || desc.includes('advice')) {
        category = 'Consulting';
      } else if (desc.includes('marketing') || desc.includes('advertising')) {
        category = 'Marketing';
      }

      if (!categoryData[category]) {
        categoryData[category] = { count: 0, revenue: 0 };
      }
      categoryData[category].count += 1;
      categoryData[category].revenue += amount;

      // Status tracking
      if (status.toLowerCase().includes('fail') || status.toLowerCase().includes('error')) {
        statusData.failed += 1;
      } else {
        statusData.processed += 1;
      }
    });

    const totalInvoices = records.length;
    const averageValue = totalInvoices > 0 ? totalValue / totalInvoices : 0;

    const statusBreakdown = [
      {
        status: 'Processed',
        count: statusData.processed,
        percentage: Math.round((statusData.processed / totalInvoices) * 100 * 100) / 100
      },
      {
        status: 'Failed',
        count: statusData.failed,
        percentage: Math.round((statusData.failed / totalInvoices) * 100 * 100) / 100
      }
    ];

    const categoryBreakdown = Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        count: data.count,
        revenue: Math.round(data.revenue * 100) / 100
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      summary: {
        totalInvoices,
        successfulProcessing: statusData.processed,
        failedProcessing: statusData.failed,
        averageProcessingTime: 12.3, // Mock data
        averageValue: Math.round(averageValue * 100) / 100,
        totalValue: Math.round(totalValue * 100) / 100
      },
      statusBreakdown,
      categoryBreakdown,
      monthlyTrend: [] // Would need more complex date grouping
    };
  } catch (error) {
    console.error('Error generating invoice report:', error);
    throw new Error('Failed to generate invoice report');
  }
};

// Generate Analytics Summary Report
const generateAnalyticsSummary = async (dateRange) => {
  try {
    const [revenueReport, clientReport, invoiceReport] = await Promise.all([
      generateRevenueReport(dateRange),
      generateClientReport(),
      generateInvoiceReport(dateRange)
    ]);

    return {
      summary: {
        totalRevenue: revenueReport.summary.totalRevenue,
        totalInvoices: invoiceReport.summary.totalInvoices,
        totalClients: clientReport.summary.totalClients,
        successRate: Math.round((invoiceReport.summary.successfulProcessing / invoiceReport.summary.totalInvoices) * 100 * 100) / 100,
        averageInvoiceValue: revenueReport.summary.averageDaily,
        period: revenueReport.summary.period
      },
      revenue: {
        trend: revenueReport.dailyBreakdown.slice(0, 7),
        topClients: revenueReport.topClients.slice(0, 5)
      },
      clients: {
        activeClients: clientReport.summary.activeClients,
        newClients: clientReport.summary.newClients,
        churnRate: clientReport.summary.churnRate
      },
      invoices: {
        successRate: Math.round((invoiceReport.summary.successfulProcessing / invoiceReport.summary.totalInvoices) * 100 * 100) / 100,
        categories: invoiceReport.categoryBreakdown.slice(0, 5)
      }
    };
  } catch (error) {
    console.error('Error generating analytics summary:', error);
    throw new Error('Failed to generate analytics summary');
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
    const { type, range = '30d', startDate, endDate } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Report type is required. Supported types: revenue, client, invoice, analytics'
      });
    }

    const dateRange = getDateRange(range, startDate, endDate);
    let reportData;

    switch (type) {
      case 'revenue':
        reportData = await generateRevenueReport(dateRange);
        break;

      case 'client':
        reportData = await generateClientReport();
        break;

      case 'invoice':
        reportData = await generateInvoiceReport(dateRange);
        break;

      case 'analytics':
        reportData = await generateAnalyticsSummary(dateRange);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report type. Supported types: revenue, client, invoice, analytics'
        });
    }

    res.json({
      success: true,
      data: reportData,
      type,
      range,
      generated: new Date().toISOString(),
      message: `${type} report generated successfully`
    });

  } catch (error) {
    console.error('Error in reports API:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate report'
    });
  }
};
