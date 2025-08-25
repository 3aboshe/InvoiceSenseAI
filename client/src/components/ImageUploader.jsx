import React from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, FileText, Sparkles, Loader2, File } from 'lucide-react'

const ImageUploader = ({ onUpload, isLoading, error }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles[0])
      }
    }
  })

  return (
    <div className="space-y-6 sm:space-y-8 w-full overflow-hidden max-w-full">
      {/* Main Upload Area */}
      <div className="glass-card p-4 sm:p-6 lg:p-8 w-full overflow-hidden max-w-full">
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
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white text-center">
                  Processing Your Invoice
                </h3>
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg text-center">
                  Our AI is analyzing and extracting data from your invoice
                </p>
              </div>
            </div>
          ) : (
            // Default State
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-slate-800 rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white text-center">
                  {isDragActive ? 'Drop your invoice here' : 'Upload Invoice'}
                </h3>
                <p className="text-slate-400 text-sm sm:text-base lg:text-lg text-center">
                  {isDragActive 
                    ? 'Release to upload and process your invoice' 
                    : 'Drag & drop an invoice image or PDF, or click to browse'
                  }
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-slate-400">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>JPEG, PNG, GIF</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <File className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
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
          <div className="glass-card p-4 bg-red-900/20 border border-red-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-900/50 rounded-lg">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-200">
                  Processing Error
                </h3>
                <p className="text-sm text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default ImageUploader
