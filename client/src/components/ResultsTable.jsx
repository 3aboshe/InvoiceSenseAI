import React from 'react'
import { 
  CheckCircle, 
  Building2, 
  User, 
  Package, 
  DollarSign, 
  TrendingUp,
  RefreshCw
} from 'lucide-react'

const ResultsTable = ({ data, darkMode, autoConvertCurrency }) => {
  const { company, client_id, line_items, invoice_number, date, total_amount, currency } = data

  const formatCurrency = (amount, curr = currency) => {
    if (!amount) return 'N/A'
    const num = parseFloat(amount)
    if (isNaN(num)) return amount
    
    if (curr === 'IQD' || curr === 'د.ع') {
      return new Intl.NumberFormat('ar-IQ', {
        style: 'currency',
        currency: 'IQD',
        minimumFractionDigits: 0
      }).format(num)
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr || 'USD',
      minimumFractionDigits: 2
    }).format(num)
  }

  const calculateTotal = () => {
    if (total_amount) return total_amount
    if (!line_items) return 0
    
    return line_items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0
      return sum + amount
    }, 0)
  }

  const hasConvertedItems = line_items?.some(item => item.converted)

  return (
    <div className="space-y-4">
      {/* Success Header */}
      <div className={`glass-card p-3 sm:p-4 lg:p-6 ${darkMode ? 'dark' : ''}`}>
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg sm:rounded-xl lg:rounded-2xl">
            <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 dark:text-white">
              Invoice Processed Successfully
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-xs sm:text-sm">
              AI has extracted and organized your invoice data
            </p>
          </div>
        </div>

        {/* Currency Conversion Notice */}
        {hasConvertedItems && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Currency Converted: IQD → USD (Rate: 100 USD = 141,000 IQD)
              </span>
            </div>
          </div>
        )}

        {/* Invoice Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className={`glass-card-hover p-3 sm:p-4 relative overflow-hidden ${darkMode ? 'dark' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 dark:from-blue-400/10 dark:to-indigo-500/10 rounded-xl -z-10"></div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Company</p>
                <p className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                  {company || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className={`glass-card-hover p-3 sm:p-4 relative overflow-hidden ${darkMode ? 'dark' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 dark:from-purple-400/10 dark:to-pink-500/10 rounded-xl -z-10"></div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl flex-shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Client ID</p>
                <div className="group relative">
                  <p className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {client_id || 'N/A'}
                  </p>
                  {client_id && client_id.length > 20 && (
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 max-w-xs break-words">
                      {client_id}
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className={`glass-card-hover p-3 sm:p-4 relative overflow-hidden ${darkMode ? 'dark' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5 dark:from-green-400/10 dark:to-emerald-500/10 rounded-xl -z-10"></div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-xl flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Items</p>
                <p className="text-sm sm:text-lg font-semibold text-slate-900 dark:text-white">
                  {line_items?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className={`glass-card-hover p-3 sm:p-4 ${darkMode ? 'dark' : ''}`}>
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 dark:from-blue-400/20 dark:to-indigo-500/20 rounded-xl -z-10`}></div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(calculateTotal())}
                </p>
                {hasConvertedItems && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Converted from IQD
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">Processed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className={`glass-card p-3 sm:p-4 lg:p-6 ${darkMode ? 'dark' : ''}`}>
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Line Items
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  Description
                </th>
                <th className="text-right py-3 px-4 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  Quantity
                </th>
                <th className="text-right py-3 px-4 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  Unit Price
                </th>
                <th className="text-right py-3 px-4 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {line_items?.map((item, index) => (
                <tr key={index} className="table-row border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 px-4 text-sm text-slate-900 dark:text-white">
                    <div>
                      <p className="font-medium">{item.description || 'N/A'}</p>
                      {item.converted && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Originally: {formatCurrency(item.original_amount, item.original_currency)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900 dark:text-white text-right">
                    {item.quantity || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900 dark:text-white text-right">
                    {item.unit_price ? formatCurrency(item.unit_price, item.currency) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-900 dark:text-white text-right font-medium">
                    {formatCurrency(item.amount, item.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ResultsTable
