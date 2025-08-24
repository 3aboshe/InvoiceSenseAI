import React, { useState } from 'react'
import { Sparkles, Moon, Sun } from 'lucide-react'
import ImageUploader from './components/ImageUploader'
import ResultsTable from './components/ResultsTable'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [autoConvertCurrency, setAutoConvertCurrency] = useState(false)

  // Currency conversion rate
  const IQD_TO_USD_RATE = 141000 // 100 USD = 141,000 IQD

  const handleUpload = async (file) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
  
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleCurrencyConversion = () => {
    setAutoConvertCurrency(!autoConvertCurrency)
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-slate-900'
    }`}>
      {/* Simple Header */}
      <header className="mx-4 sm:mx-6 mt-4 sm:mt-6 mb-3 sm:mb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
                  InvoiceSense AI
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                  AI-powered invoice data extraction
                </p>
              </div>
            </div>
            
            {/* Settings Toggles */}
            <div className="flex items-center space-x-3">
              {/* Currency Conversion Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  IQD→USD
                </span>
                <button
                  onClick={toggleCurrencyConversion}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    autoConvertCurrency 
                      ? 'bg-blue-600 dark:bg-blue-500' 
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoConvertCurrency ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
                    : 'bg-white hover:bg-slate-50 text-slate-600 shadow-lg'
                }`}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 pb-4">
        <div className="max-w-6xl mx-auto space-y-2">
          {/* Upload Section */}
          <ImageUploader 
            onUpload={handleUpload} 
            isLoading={isLoading} 
            error={error}
            darkMode={darkMode}
          />
          
          {/* Results Section */}
          {results && (
            <ResultsTable 
              data={results} 
              darkMode={darkMode}
              autoConvertCurrency={autoConvertCurrency}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
