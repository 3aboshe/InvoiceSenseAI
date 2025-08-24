import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, AlertCircle, Camera, FileText, Sparkles } from 'lucide-react'

const ImageUploader = ({ onUpload, isLoading, error }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: isLoading
  })

  return (
    <div className="space-y-8">
      {/* Main Upload Area */}
      <div className="glass-card p-8">
        <div
          {...getRootProps()}
          className={`
            dropzone
            ${isDragActive ? 'dropzone-active' : ''}
            ${isLoading ? 'pointer-events-none opacity-75' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isLoading ? (
            // Loading State
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Processing Your Invoice
                </h3>
                <p className="text-slate-600 text-lg">
                  Our AI is analyzing and extracting data from your invoice
                </p>
                <div className="flex justify-center">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Default State
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {isDragActive ? 'Drop your invoice here' : 'Upload Invoice Image'}
                </h3>
                <p className="text-slate-600 text-lg">
                  {isDragActive 
                    ? 'Release to upload and process your invoice' 
                    : 'Drag & drop an invoice image, or click to browse'
                  }
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>JPEG, PNG, GIF</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Powered</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="glass-card p-6 border-l-4 border-red-400">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Processing Error
              </h3>
              <p className="text-red-700 leading-relaxed">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 btn-secondary text-sm px-4 py-2"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
