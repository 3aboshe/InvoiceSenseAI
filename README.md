# InvoiceSenseAI

A modern, AI-powered invoice data extraction application with a beautiful Apple-inspired interface.

## 🚀 Features

- **AI-Powered Processing**: Uses Groq's advanced language models for accurate invoice data extraction
- **Beautiful UI**: Modern Apple-inspired design with glassmorphism effects
- **Drag & Drop**: Intuitive file upload with visual feedback
- **Real-time Processing**: Live progress indicators and status updates
- **Airtable Integration**: Automatic data storage and organization
- **Responsive Design**: Works perfectly on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Dropzone** for file uploads

### Backend
- **Node.js** with Express
- **Groq AI** for invoice processing
- **Airtable** for data storage
- **Multer** for file handling

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Groq API key
- Airtable account and API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd invoice-extractor-app
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the `server` directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   AIRTABLE_API_KEY=your_airtable_api_key_here
   AIRTABLE_BASE_ID=your_airtable_base_id_here
   AIRTABLE_TABLE_NAME=Invoices
   PORT=3001
   ```

4. **Airtable Setup**
   
   Create a table called "Invoices" with these fields:
   - Client ID (Single line text)
   - Company (Single line text)
   - Description (Long text)
   - Quantity (Number)
   - Unit Price (Currency)
   - Total (Currency)

## 🚀 Development

### Start Frontend
```bash
cd client
npm run dev
```
Frontend will be available at `http://localhost:5173`

### Start Backend
```bash
cd server
npm start
```
Backend will be available at `http://localhost:3001`

## 🌐 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set build command: `cd client && npm install && npm run build`
4. Set output directory: `client/dist`
5. Add environment variables in Vercel dashboard

### Backend (Railway/Render/Heroku)
1. Deploy the `server` directory to your preferred backend hosting
2. Update the frontend API URL to point to your deployed backend
3. Set environment variables on your hosting platform

## 📱 Usage

1. Open the application in your browser
2. Drag and drop an invoice image or click to browse
3. Wait for AI processing (usually takes 10-30 seconds)
4. View extracted data in the beautiful interface
5. Data is automatically saved to Airtable

## 🔧 Configuration

### API Endpoints
- `POST /api/upload` - Upload and process invoice images
- `GET /api/health` - Health check endpoint
- `POST /api/demo` - Demo endpoint for testing

### Supported File Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ahmed Qanadr** - AI-powered invoice extraction solution

---

Made with ❤️ and AI
