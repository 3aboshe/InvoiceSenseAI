import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  FileText, 
  Users, 
  DollarSign, 
  Calendar,
  BarChart3,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with real API calls
  const mockAnalytics = {
    kpis: {
      totalRevenue: 45678.90,
      totalInvoices: 234,
      totalClients: 45,
      successRate: 98.5,
      avgProcessingTime: 12.3
    },
    revenueGrowth: 15.2,
    invoiceGrowth: 8.7,
    clientGrowth: 12.1,
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      console.log('Loading analytics data...');
      // Use relative URL since API is on the same domain
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      
      console.log('Analytics response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Analytics response data:', responseData);
      
      if (responseData.success) {
        // Transform the API response to match our component structure
        const transformedData = {
          kpis: responseData.data.kpis || responseData.data,
          revenueGrowth: responseData.data.kpis?.revenueGrowth || responseData.data.revenueGrowth || 15.2,
          invoiceGrowth: responseData.data.kpis?.invoiceGrowth || responseData.data.invoiceGrowth || 8.7,
          clientGrowth: responseData.data.kpis?.clientGrowth || responseData.data.clientGrowth || 12.1,
          revenueData: responseData.data.revenueData || mockAnalytics.revenueData,
          topClients: responseData.data.topClients || mockAnalytics.topClients,
          currencyDistribution: responseData.data.currencyDistribution || mockAnalytics.currencyDistribution,
          invoiceCategories: responseData.data.invoiceCategories || mockAnalytics.invoiceCategories,
          recentActivity: responseData.data.recentActivity || mockAnalytics.recentActivity
        };
        console.log('Setting analytics data:', transformedData);
        setAnalytics(transformedData);
      } else {
        console.log('API returned success: false, using mock data');
        // Fallback to mock data if API fails
        setAnalytics(mockAnalytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      console.log('Using mock data due to error');
      // Fallback to mock data on error
      setAnalytics(mockAnalytics);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-slate-700 rounded-xl"></div>
              <div className="h-80 bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we always have data to render
  if (!analytics) {
    console.log('No analytics data, using mock data');
    setAnalytics(mockAnalytics);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-white mb-4">Loading Dashboard...</h1>
            <p className="text-slate-400">Please wait while we load your analytics data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Welcome back! Here's what's happening with your invoices.</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {/* Time Range Selector */}
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            
            {/* Refresh Button */}
            <button 
              onClick={refreshData}
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(analytics.kpis.totalRevenue)}
                </p>
                <p className="text-green-400 text-sm mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analytics.revenueGrowth}%
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Invoices</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatNumber(analytics.kpis.totalInvoices)}
                </p>
                <p className="text-blue-400 text-sm mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analytics.invoiceGrowth}%
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Clients</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatNumber(analytics.kpis.totalClients)}
                </p>
                <p className="text-purple-400 text-sm mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{analytics.clientGrowth}%
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {analytics.kpis.successRate}%
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Avg {analytics.kpis.avgProcessingTime}s processing
                </p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Revenue</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => format(parseISO(value), 'MMM dd, yyyy')}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Clients */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Top Clients</h3>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {analytics.topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{client.name}</p>
                      <p className="text-sm text-slate-400">{client.invoices} invoices</p>
                    </div>
                  </div>
                  <p className="font-semibold text-white">{formatCurrency(client.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Currency Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Currency Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.currencyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.currencyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Invoice Categories */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Invoice Categories</h3>
            <div className="space-y-4">
              {analytics.invoiceCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{category.category}</p>
                    <p className="text-sm text-slate-400">{category.count} invoices</p>
                  </div>
                  <p className="font-semibold text-white">{formatCurrency(category.revenue)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'invoice' ? 'bg-blue-400' : 'bg-green-400'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.client}</p>
                    {activity.amount && (
                      <p className="text-green-400 text-sm">{formatCurrency(activity.amount)}</p>
                    )}
                    <p className="text-slate-400 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
