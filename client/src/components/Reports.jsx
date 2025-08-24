import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  PieChart,
  Printer
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const Reports = () => {
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const reportTypes = [
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign, description: 'Detailed revenue analysis and trends' },
    { id: 'client', name: 'Client Report', icon: Users, description: 'Client activity and performance metrics' },
    { id: 'invoice', name: 'Invoice Report', icon: FileText, description: 'Invoice processing and status overview' },
    { id: 'analytics', name: 'Analytics Summary', icon: BarChart3, description: 'Comprehensive business analytics' }
  ];

  const dateRanges = [
    { id: '7d', name: 'Last 7 days' },
    { id: '30d', name: 'Last 30 days' },
    { id: '90d', name: 'Last 90 days' },
    { id: 'mtd', name: 'Month to date' },
    { id: 'ytd', name: 'Year to date' },
    { id: 'custom', name: 'Custom range' }
  ];

  const exportFormats = [
    { id: 'csv', name: 'CSV', description: 'Comma-separated values' },
    { id: 'pdf', name: 'PDF', description: 'Portable document format' },
    { id: 'excel', name: 'Excel', description: 'Microsoft Excel format' }
  ];

  useEffect(() => {
    if (reportType && dateRange) {
      generateReport();
    }
  }, [reportType, dateRange, customStartDate, customEndDate]);

  const getDateRangeValues = () => {
    const now = new Date();
    let start, end;

    switch (dateRange) {
      case '7d':
        start = subDays(now, 7);
        end = now;
        break;
      case '30d':
        start = subDays(now, 30);
        end = now;
        break;
      case '90d':
        start = subDays(now, 90);
        end = now;
        break;
      case 'mtd':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'ytd':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'custom':
        start = customStartDate ? new Date(customStartDate) : subDays(now, 30);
        end = customEndDate ? new Date(customEndDate) : now;
        break;
      default:
        start = subDays(now, 30);
        end = now;
    }

    return { start, end };
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { start, end } = getDateRangeValues();
      
      // Mock report data based on type
      const mockData = generateMockReportData(reportType, start, end);
      setReportData(mockData);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockReportData = (type, start, end) => {
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    switch (type) {
      case 'revenue':
        return {
          summary: {
            totalRevenue: 45678.90,
            averageDaily: 1522.63,
            highestDay: 2845.30,
            lowestDay: 890.45,
            growthRate: 15.2
          },
          dailyBreakdown: Array.from({ length: days }, (_, i) => ({
            date: format(new Date(start.getTime() + i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            revenue: Math.random() * 2000 + 800,
            invoices: Math.floor(Math.random() * 10) + 1
          })),
          topClients: [
            { name: 'Tech Solutions Inc', revenue: 8900 },
            { name: 'Digital Marketing Co', revenue: 7600 },
            { name: 'Creative Agency', revenue: 6800 }
          ]
        };
        
      case 'client':
        return {
          summary: {
            totalClients: 45,
            activeClients: 38,
            newClients: 7,
            churnRate: 4.2
          },
          clientList: [
            { name: 'Tech Solutions Inc', revenue: 8900, invoices: 12, status: 'active' },
            { name: 'Digital Marketing Co', revenue: 7600, invoices: 8, status: 'active' },
            { name: 'Creative Agency', revenue: 6800, invoices: 15, status: 'active' }
          ],
          acquisition: Array.from({ length: Math.min(days, 30) }, (_, i) => ({
            date: format(new Date(start.getTime() + i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
            newClients: Math.floor(Math.random() * 3)
          }))
        };
        
      case 'invoice':
        return {
          summary: {
            totalInvoices: 234,
            successfulProcessing: 230,
            failedProcessing: 4,
            averageProcessingTime: 12.3
          },
          statusBreakdown: [
            { status: 'Processed', count: 230, percentage: 98.3 },
            { status: 'Failed', count: 4, percentage: 1.7 }
          ],
          categoryBreakdown: [
            { category: 'Web Development', count: 45, revenue: 15600 },
            { category: 'Design Services', count: 32, revenue: 12400 },
            { category: 'Consulting', count: 28, revenue: 9800 }
          ]
        };
        
      default:
        return {
          summary: {
            totalRevenue: 45678.90,
            totalInvoices: 234,
            totalClients: 45,
            successRate: 98.5
          }
        };
    }
  };

  const exportReport = async (format) => {
    try {
      // Simulate export process
      console.log(`Exporting ${reportType} report as ${format}...`);
      
      // Create downloadable content
      let content, filename, mimeType;
      
      if (format === 'csv') {
        content = generateCSV(reportData);
        filename = `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'pdf') {
        // For PDF, you would typically use a library like jsPDF
        content = generatePDFContent(reportData);
        filename = `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        mimeType = 'application/pdf';
      } else {
        // Excel format
        content = generateExcelContent(reportData);
        filename = `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      
      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const generateCSV = (data) => {
    if (!data) return '';
    
    let csv = '';
    
    // Add summary section
    if (data.summary) {
      csv += 'Summary\n';
      Object.entries(data.summary).forEach(([key, value]) => {
        csv += `${key},${value}\n`;
      });
      csv += '\n';
    }
    
    // Add detailed data
    if (data.dailyBreakdown) {
      csv += 'Date,Revenue,Invoices\n';
      data.dailyBreakdown.forEach(day => {
        csv += `${day.date},${day.revenue.toFixed(2)},${day.invoices}\n`;
      });
    } else if (data.clientList) {
      csv += 'Client Name,Revenue,Invoices,Status\n';
      data.clientList.forEach(client => {
        csv += `${client.name},${client.revenue},${client.invoices},${client.status}\n`;
      });
    }
    
    return csv;
  };

  const generatePDFContent = (data) => {
    // Simplified PDF content - in production, use jsPDF or similar
    return `PDF Report Content:\n${JSON.stringify(data, null, 2)}`;
  };

  const generateExcelContent = (data) => {
    // Simplified Excel content - in production, use SheetJS or similar
    return generateCSV(data);
  };

  const printReport = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'revenue':
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Total Revenue</h4>
                <p className="text-2xl font-bold text-white">{formatCurrency(reportData.summary.totalRevenue)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Average Daily</h4>
                <p className="text-2xl font-bold text-white">{formatCurrency(reportData.summary.averageDaily)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Highest Day</h4>
                <p className="text-2xl font-bold text-white">{formatCurrency(reportData.summary.highestDay)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Growth Rate</h4>
                <p className="text-2xl font-bold text-green-400">+{reportData.summary.growthRate}%</p>
              </div>
            </div>

            {/* Top Clients */}
            <div className="bg-slate-700/50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Top Clients</h4>
              <div className="space-y-3">
                {reportData.topClients.map((client, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-slate-300">{client.name}</span>
                    <span className="font-semibold text-white">{formatCurrency(client.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'client':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Total Clients</h4>
                <p className="text-2xl font-bold text-white">{reportData.summary.totalClients}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Active Clients</h4>
                <p className="text-2xl font-bold text-green-400">{reportData.summary.activeClients}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">New Clients</h4>
                <p className="text-2xl font-bold text-blue-400">{reportData.summary.newClients}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Churn Rate</h4>
                <p className="text-2xl font-bold text-red-400">{reportData.summary.churnRate}%</p>
              </div>
            </div>
          </div>
        );

      case 'invoice':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Total Invoices</h4>
                <p className="text-2xl font-bold text-white">{reportData.summary.totalInvoices}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Successful</h4>
                <p className="text-2xl font-bold text-green-400">{reportData.summary.successfulProcessing}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Failed</h4>
                <p className="text-2xl font-bold text-red-400">{reportData.summary.failedProcessing}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-400">Avg Processing</h4>
                <p className="text-2xl font-bold text-white">{reportData.summary.averageProcessingTime}s</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">Select a report type to view data</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-slate-400">Generate and export detailed business reports.</p>
        </div>

        {/* Report Configuration */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Report Type</label>
              <div className="space-y-2">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      reportType === type.id
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <type.icon className="w-5 h-5" />
                      <div>
                        <p className="font-medium">{type.name}</p>
                        <p className="text-xs opacity-75">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Date Range</label>
              <div className="space-y-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dateRanges.map((range) => (
                    <option key={range.id} value={range.id}>{range.name}</option>
                  ))}
                </select>

                {dateRange === 'custom' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Export & Actions</label>
              <div className="space-y-3">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {exportFormats.map((format) => (
                    <option key={format.id} value={format.id}>{format.name} - {format.description}</option>
                  ))}
                </select>

                <div className="flex space-x-2">
                  <button
                    onClick={() => exportReport(exportFormat)}
                    disabled={!reportData || loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  
                  <button
                    onClick={printReport}
                    disabled={!reportData || loading}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Generating report...</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {reportTypes.find(t => t.id === reportType)?.name || 'Report'}
                </h3>
                <p className="text-sm text-slate-400">
                  Generated on {format(new Date(), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              {renderReportContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
