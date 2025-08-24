import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import ResultsTable from './components/ResultsTable'
import { Sparkles, Zap, CheckCircle } from 'lucide-react'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [invoiceData, setInvoiceData] = useState(null)

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

      const result = await response.json()

      if (result.success) {
        setInvoiceData(result.data)
      } else {
        setError(result.error || 'Failed to process invoice')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple Header */}
      <header className="mx-4 sm:mx-6 mt-4 sm:mt-6 mb-3 sm:mb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                InvoiceSense AI
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm">
                AI-powered invoice data extraction
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 pb-4">
        <div className="max-w-6xl mx-auto space-y-2">
          {/* Upload Section */}
          <div className="slide-up">
            <ImageUploader 
              onUpload={handleUpload}
              isLoading={isLoading}
              error={error}
            />
          </div>

          {/* Results Section */}
          {invoiceData && (
            <div className="fade-in">
              <ResultsTable data={invoiceData} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
