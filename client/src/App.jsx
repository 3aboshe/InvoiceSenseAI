import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Sparkles, Moon, Sun, BarChart3, Upload, Users, FileText } from 'lucide-react'
import ImageUploader from './components/ImageUploader'
import ResultsTable from './components/ResultsTable'
import Dashboard from './components/Dashboard'
import ClientManager from './components/ClientManager'
import ClientDetail from './components/ClientDetail'
import Reports from './components/Reports'

function AppContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [autoConvertCurrency, setAutoConvertCurrency] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  
  const currentPath = location.pathname

  // Currency conversion rate
  const IQD_TO_USD_RATE = 141000 // 100 USD = 141,000 IQD

  const handleUpload = async (file) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
  
      const response = await fetch(`/api/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      
      // Extract data from the response structure
      const data = responseData.data || responseData
      
      // Apply currency conversion if enabled and IQD is detected
      if (autoConvertCurrency && data.line_items) {
        data.line_items = data.line_items.map(item => {
          if (item.currency === 'IQD' || item.currency === 'د.ع') {
            const iqdAmount = parseFloat(item.amount.replace(/[^\d.-]/g, ''))
            const usdAmount = (iqdAmount / IQD_TO_USD_RATE) * 100
            return {
              ...item,
              original_amount: item.amount,
              original_currency: item.currency,
              amount: usdAmount.toFixed(2),
              currency: 'USD',
              converted: true
            }
          }
          return item
        })
      }

      setResults(data)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to process invoice')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCurrencyConversion = () => {
    setAutoConvertCurrency(!autoConvertCurrency)
  }

  const Navigation = () => (
    <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
            <div className="p-1 sm:p-1.5 lg:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-white">
                InvoiceSense AI
              </h1>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            <div className="flex items-center space-x-0.5 sm:space-x-1 bg-slate-700 rounded-lg p-0.5 sm:p-1">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2 ${
                  currentPath === '/dashboard' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Dashboard</span>
                <span className="xs:hidden">Dash</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className={`px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2 ${
                  currentPath === '/' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Upload</span>
              </button>
              <button
                onClick={() => navigate('/clients')}
                className={`px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2 ${
                  currentPath.startsWith('/clients') 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Clients</span>
              </button>
              <button
                onClick={() => navigate('/reports')}
                className={`px-1.5 sm:px-2 lg:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2 ${
                  currentPath === '/reports' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Reports</span>
              </button>
            </div>
            
            {/* Currency Toggle - Only show on upload page */}
            {currentPath === '/' && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-xs font-medium text-slate-400 hidden sm:inline">
                  IQD→USD
                </span>
                <span className="text-xs font-medium text-slate-400 sm:hidden">
                  IQD
                </span>
                <button
                  onClick={toggleCurrencyConversion}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    autoConvertCurrency 
                      ? 'bg-blue-500' 
                      : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      autoConvertCurrency ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const UploadPage = () => (
    <main className="flex-1 px-2 sm:px-4 lg:px-6 pb-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-2 mt-8 w-full">
        {/* Upload Section */}
        <ImageUploader 
          onUpload={handleUpload} 
          isLoading={isLoading} 
          error={error}
        />
        
        {/* Results Section */}
        {results && (
          <ResultsTable 
            data={results} 
            autoConvertCurrency={autoConvertCurrency}
          />
        )}
      </div>
    </main>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navigation />
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<ClientManager />} />
        <Route path="/clients/:clientId" element={<ClientDetail />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
