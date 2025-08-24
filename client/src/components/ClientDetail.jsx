import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User, 
  Mail, 
  Phone, 
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  Edit3,
  Trash2,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock client data - replace with real API calls
  const mockClients = {
    '1': {
      id: 1,
      name: 'Tech Solutions Inc',
      email: 'contact@techsolutions.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Street, San Francisco, CA 94102',
      totalRevenue: 15600,
      invoiceCount: 12,
      lastInvoice: '2024-01-15',
      status: 'active',
      joinDate: '2023-06-15',
      website: 'https://techsolutions.com',
      industry: 'Technology',
      notes: 'High-value client with consistent monthly projects. Prefers detailed technical specifications.'
    },
    '2': {
      id: 2,
      name: 'Digital Marketing Co',
      email: 'hello@digitalmarketing.com',
      phone: '+1 (555) 987-6543',
      address: '456 Marketing Ave, New York, NY 10001',
      totalRevenue: 12400,
      invoiceCount: 8,
      lastInvoice: '2024-01-12',
      status: 'active',
      joinDate: '2023-08-22',
      website: 'https://digitalmarketing.com',
      industry: 'Marketing',
      notes: 'Seasonal projects, high activity in Q4. Always pays on time.'
    },
    '3': {
      id: 3,
      name: 'Creative Agency',
      email: 'info@creativeagency.com',
      phone: '+1 (555) 456-7890',
      address: '789 Design Blvd, Los Angeles, CA 90210',
      totalRevenue: 9800,
      invoiceCount: 15,
      lastInvoice: '2024-01-10',
      status: 'active',
      joinDate: '2023-04-10',
      website: 'https://creativeagency.com',
      industry: 'Design',
      notes: 'Multiple small projects, very creative team. Requires custom invoicing.'
    }
  };

  const mockInvoices = [
    {
      id: 1,
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
    },
    {
      id: 2,
      number: 'INV-2024-002',
      date: '2024-01-08',
      dueDate: '2024-02-07',
      amount: 1800,
      status: 'paid',
      description: 'UI/UX Design Services',
      items: [
        { description: 'UI Design', quantity: 20, unitPrice: 60, total: 1200 },
        { description: 'UX Research', quantity: 10, unitPrice: 60, total: 600 }
      ]
    },
    {
      id: 3,
      number: 'INV-2023-045',
      date: '2023-12-20',
      dueDate: '2024-01-19',
      amount: 3200,
      status: 'overdue',
      description: 'Full-stack Development Project',
      items: [
        { description: 'Backend Development', quantity: 32, unitPrice: 75, total: 2400 },
        { description: 'Database Design', quantity: 10, unitPrice: 80, total: 800 }
      ]
    }
  ];

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients?id=${clientId}`);
      
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success && responseData.data) {
          setClient(responseData.data.client);
          setInvoices(responseData.data.invoices || []);
          return;
        }
      }
      
      // Fallback to mock data
      const clientData = mockClients[clientId];
      if (!clientData) {
        navigate('/clients');
        return;
      }
      
      setClient(clientData);
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error loading client data:', error);
      // Fallback to mock data
      const clientData = mockClients[clientId];
      if (clientData) {
        setClient(clientData);
        setInvoices(mockInvoices);
      } else {
        navigate('/clients');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (updatedData) => {
    setClient({ ...client, ...updatedData });
    setShowEditModal(false);
  };

  const handleDeleteClient = () => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      // In real app, make API call to delete client
      navigate('/clients');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const ClientEditModal = ({ client, onSave, onClose }) => {
    const [formData, setFormData] = useState(client || {});

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Edit Client</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Address
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Update Client
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded mb-6 w-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 h-96 bg-slate-700 rounded-xl"></div>
              <div className="lg:col-span-2 h-96 bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">Client not found</h3>
          <button
            onClick={() => navigate('/clients')}
            className="text-blue-400 hover:text-blue-300"
          >
            Return to clients list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/clients')}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{client.name}</h1>
              <p className="text-slate-400">Client Details & Invoice History</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDeleteClient}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Information */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{client.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === 'active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {client.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <span>{client.email}</span>
                </div>
                
                {client.phone && (
                  <div className="flex items-center space-x-3 text-slate-300">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span>{client.phone}</span>
                  </div>
                )}
                
                {client.address && (
                  <div className="flex items-start space-x-3 text-slate-300">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <span>{client.address}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 text-slate-300">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span>Client since {formatDate(client.joinDate)}</span>
                </div>
              </div>

              {client.notes && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Notes</h4>
                  <p className="text-slate-300 text-sm">{client.notes}</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-1 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(client.totalRevenue)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Invoices</p>
                    <p className="text-2xl font-bold text-blue-400">{client.invoiceCount}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Invoice History</h3>
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>

              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white">{invoice.number}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                        
                        <p className="text-slate-300 text-sm mb-3">{invoice.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400">Invoice Date</p>
                            <p className="text-white">{formatDate(invoice.date)}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Due Date</p>
                            <p className="text-white">{formatDate(invoice.dueDate)}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Amount</p>
                            <p className="text-white font-semibold">{formatCurrency(invoice.amount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <h5 className="text-sm font-medium text-slate-400 mb-2">Line Items</h5>
                      <div className="space-y-1">
                        {invoice.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-slate-300">{item.description} (Qty: {item.quantity})</span>
                            <span className="text-white">{formatCurrency(item.total)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ClientEditModal
          client={client}
          onSave={handleEditClient}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default ClientDetail;
