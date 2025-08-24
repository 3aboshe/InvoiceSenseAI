import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Eye
} from 'lucide-react';

const ClientManager = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [sortBy, setSortBy] = useState('revenue');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock client data - replace with real API calls
  const mockClients = [
    {
      id: 1,
      name: 'Tech Solutions Inc',
      email: 'contact@techsolutions.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Street, San Francisco, CA',
      totalRevenue: 15600,
      invoiceCount: 12,
      lastInvoice: '2024-01-15',
      status: 'active',
      joinDate: '2023-06-15'
    },
    {
      id: 2,
      name: 'Digital Marketing Co',
      email: 'hello@digitalmarketing.com',
      phone: '+1 (555) 987-6543',
      address: '456 Marketing Ave, New York, NY',
      totalRevenue: 12400,
      invoiceCount: 8,
      lastInvoice: '2024-01-12',
      status: 'active',
      joinDate: '2023-08-22'
    },
    {
      id: 3,
      name: 'Creative Agency',
      email: 'info@creativeagency.com',
      phone: '+1 (555) 456-7890',
      address: '789 Design Blvd, Los Angeles, CA',
      totalRevenue: 9800,
      invoiceCount: 15,
      lastInvoice: '2024-01-10',
      status: 'active',
      joinDate: '2023-04-10'
    },
    {
      id: 4,
      name: 'Consulting Group',
      email: 'admin@consultinggroup.com',
      phone: '+1 (555) 321-0987',
      address: '321 Business St, Chicago, IL',
      totalRevenue: 7900,
      invoiceCount: 6,
      lastInvoice: '2023-12-28',
      status: 'inactive',
      joinDate: '2023-02-05'
    }
  ];

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/clients`);
      
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          setClients(responseData.data);
        } else {
          setClients(mockClients);
        }
      } else {
        setClients(mockClients);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients(mockClients);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          setClients([...clients, responseData.data]);
          setShowAddModal(false);
          return;
        }
      }
      
      // Fallback to local update
      const newClient = {
        id: Date.now(),
        ...clientData,
        totalRevenue: 0,
        invoiceCount: 0,
        lastInvoice: null,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      setClients([...clients, newClient]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding client:', error);
      // Fallback to local update
      const newClient = {
        id: Date.now(),
        ...clientData,
        totalRevenue: 0,
        invoiceCount: 0,
        lastInvoice: null,
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
      };
      setClients([...clients, newClient]);
      setShowAddModal(false);
    }
  };

  const handleEditClient = (clientData) => {
    setClients(clients.map(client => 
      client.id === editingClient.id 
        ? { ...client, ...clientData }
        : client
    ));
    setEditingClient(null);
  };

  const handleDeleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(client => client.id !== clientId));
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.totalRevenue - a.totalRevenue;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'invoices':
        return b.invoiceCount - a.invoiceCount;
      case 'lastInvoice':
        return new Date(b.lastInvoice || 0) - new Date(a.lastInvoice || 0);
      default:
        return 0;
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ClientModal = ({ client, onSave, onClose }) => {
    const [formData, setFormData] = useState(client || {
      name: '',
      email: '',
      phone: '',
      address: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            {client ? 'Edit Client' : 'Add New Client'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={formData.name}
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
                value={formData.email}
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
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {client ? 'Update' : 'Add'} Client
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
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-700 rounded-xl"></div>
              ))}
            </div>
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
            <h1 className="text-3xl font-bold text-white mb-2">Client Management</h1>
            <p className="text-slate-400">Manage your client relationships and track their activity.</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="name">Sort by Name</option>
              <option value="invoices">Sort by Invoices</option>
              <option value="lastInvoice">Sort by Last Invoice</option>
            </select>
            
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Clients</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-4">
          {sortedClients.map((client) => (
            <div key={client.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {client.name.charAt(0)}
                  </div>
                  
                  {/* Client Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{client.address}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-green-400">{formatCurrency(client.totalRevenue)}</span>
                          <span className="text-slate-400">({client.invoiceCount} invoices)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Last invoice: {formatDate(client.lastInvoice)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Client since: {formatDate(client.joinDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingClient(client)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit Client"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Delete Client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {sortedClients.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No clients found</h3>
              <p className="text-slate-400">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first client.'}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add/Edit Modal */}
      {(showAddModal || editingClient) && (
        <ClientModal
          client={editingClient}
          onSave={editingClient ? handleEditClient : handleAddClient}
          onClose={() => {
            setShowAddModal(false);
            setEditingClient(null);
          }}
        />
      )}
    </div>
  );
};

export default ClientManager;
