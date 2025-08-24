import { CheckCircle, Building2, User, Package, DollarSign, TrendingUp, Sparkles } from 'lucide-react'

const ResultsTable = ({ data }) => {
  const { client_id, company, line_items } = data

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const calculateTotal = () => {
    if (!line_items) return 0
    return line_items.reduce((sum, item) => sum + (item.total || 0), 0)
  }

  return (
    <div className="space-y-4">
      {/* Success Header */}
      <div className="glass-card p-3 sm:p-4 lg:p-6">
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg sm:rounded-xl lg:rounded-2xl">
            <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Invoice Processed Successfully
            </h2>
            <p className="text-slate-600 mt-1 text-xs sm:text-sm">
              AI has extracted and organized your invoice data
            </p>
          </div>
        </div>

        {/* Invoice Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="glass-card-hover p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl flex-shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600">Company</p>
                <p className="text-sm sm:text-lg font-semibold text-slate-900 truncate">
                  {company || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="glass-card-hover p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl flex-shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600">Client ID</p>
                <div className="group relative">
                  <p className="text-sm sm:text-lg font-semibold text-slate-900 truncate">
                    {client_id || 'N/A'}
                  </p>
                  {client_id && client_id.length > 20 && (
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-slate-900 text-white text-xs sm:text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 max-w-xs break-words">
                      {client_id}
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="glass-card-hover p-3 sm:p-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-600">Items</p>
                <p className="text-sm sm:text-lg font-semibold text-slate-900">
                  {line_items?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="glass-card-hover p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-600">Total Amount</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                  {formatCurrency(calculateTotal())}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">Processed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Package className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">
            Line Items ({line_items?.length || 0} items)
          </h3>
        </div>
        
        {line_items && line_items.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200/50">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Unit Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {line_items.map((item, index) => (
                  <tr key={index} className="table-row">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                      {item.description || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {item.quantity ? formatNumber(item.quantity) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {item.unit_price ? formatCurrency(item.unit_price) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {item.total ? formatCurrency(item.total) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg">No line items found in the invoice</p>
          </div>
        )}
      </div>

      {/* Success Footer */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Data successfully extracted and saved
              </p>
              <p className="text-xs text-slate-500">
                Your invoice data has been processed and organized
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary text-sm px-6 py-2"
          >
            Process Another
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultsTable
