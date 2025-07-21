# AEO Auditor

A modern web application for analyzing how well web pages perform in LLM-powered search engines like ChatGPT, Claude, and Perplexity.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 15.4.1, TypeScript, and Tailwind CSS
- **Component Architecture**: Clean, reusable components following best practices
- **Form Validation**: Robust URL validation using react-hook-form and Zod
- **Dark Theme**: Professional dark-themed interface optimized for SEO professionals
- **Responsive Design**: Mobile-friendly layout that works on all devices
- **App Router**: Uses Next.js App Router for optimal performance
- **Report Page**: URL parameter extraction, validation, and error handling
- **Backend API**: Fastify-based data collection service with comprehensive crawling

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.4.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Linting**: ESLint
- **Architecture**: Component-based design with proper separation of concerns

### Backend
- **Framework**: Fastify for high-performance API
- **Language**: JavaScript (Node.js)
- **HTML Parsing**: Cheerio for metadata extraction
- **CORS**: Configured for frontend communication
- **Logging**: Custom colored logging with timestamps
- **Architecture**: Service-based design with route separation

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development servers:
   ```bash
   # Frontend (port 3000)
   npm run dev
   
   # Backend API (port 3001) - in separate terminal
   npm run api
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Architecture

### Frontend Structure
```
src/
├── app/
│   ├── layout.tsx                   # Root layout with metadata
│   ├── page.tsx                     # Homepage (composed of components)
│   └── report/
│       └── page.tsx                 # Report page with URL analysis
└── components/
    ├── ui/                          # Generic reusable UI components
    │   ├── Header.tsx               # Application header
    │   ├── Footer.tsx               # Application footer
    │   ├── HeroSection.tsx          # Hero section display
    │   ├── ExampleLink.tsx          # Interactive example link
    │   ├── ErrorMessage.tsx         # Error display component
    │   ├── BackButton.tsx           # Navigation button
    │   └── AnalysisPlaceholder.tsx  # Analysis placeholder
    ├── forms/                       # Form-specific components
    │   └── UrlForm.tsx              # URL input form with validation
    └── layouts/                     # Page layout components
        └── ReportLayout.tsx         # Report page wrapper
```

### Backend Structure
```
api/
├── server.js                       # Main Fastify server
├── routes/
│   ├── health.js                   # Health check endpoints
│   └── collect-data.js             # Data collection routes
├── services/
│   └── crawler.js                  # HTML/robots.txt/sitemap crawler
└── utils/
    └── logger.js                   # Colored logging utility
```

### Architecture Principles
- **Single Responsibility**: Each component has one clear purpose
- **Reusability First**: Components designed for reuse across pages
- **TypeScript Interfaces**: All components have proper type definitions
- **Composition**: Complex UIs built by composing simple components
- **Service Separation**: Backend services are modular and testable

## 🎯 Application Features

### Homepage (/)
- **Header**: Clean branding with "AEO Auditor" title
- **Hero Section**: "Optimize Your Content for AI Search" with subtitle
- **URL Form**: Input validation, error handling, submit to `/report`
- **Example Link**: Clickable "Try: https://example.com"
- **Footer**: "Built for SEO professionals"

### Report Page (/report)
- **URL Parameter Extraction**: Gets URL from `?url=...` query param
- **URL Validation**: Validates format and protocol (http/https)
- **Analysis Integration**: Complete frontend-backend API integration
- **Real-time Analysis**: Live progress logs and status updates
- **Data Collection Display**: Visual results with status icons
- **Error Handling**: Comprehensive error management with retry options
- **Analysis States**: Idle, running, completed, error with appropriate UI
- **Summary Dashboard**: Metrics display with performance data
- **Responsive Layout**: Modern, mobile-friendly interface

### Backend API (/api)
- **Health Endpoints**: `/api/health`, `/api/health/ping` for monitoring
- **Data Collection**: `/api/collect-data` for comprehensive web crawling
- **URL Testing**: `/api/collect-data/test` for URL validation
- **CORS Support**: Configured for frontend communication
- **Real-time Logging**: Timestamped logs with color coding
- **Error Handling**: Comprehensive error responses with details

## 🔧 Technical Features

### Frontend
- **Form Validation**: Zod Schema with real-time feedback
- **React Hook Form**: Optimized form state management
- **Error Messages**: Clear, actionable error descriptions
- **URL Handling**: Proper URL encoding/decoding
- **Protocol Check**: Ensures http:// or https:// protocols only

### Backend
- **Data Collection**: Parallel fetching of HTML, robots.txt, sitemap.xml
- **Metadata Extraction**: Title, description, charset, viewport extraction
- **Security**: Private IP blocking, content size limits (10MB)
- **Performance**: 10-second timeouts, concurrent requests
- **User Agent**: Custom `AEO-Auditor-Bot/1.0` identification

## 🌐 API Endpoints

### Data Collection
```bash
# Collect website data
POST /api/collect-data
Content-Type: application/json
{
  "url": "https://example.com"
}

# Test URL validation
GET /api/collect-data/test?url=https://example.com

# Health check
GET /api/health
```

### Response Format
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/",
    "html": {
      "success": true,
      "data": "<!doctype html>...",
      "metadata": {
        "statusCode": 200,
        "contentLength": 1256,
        "responseTime": 350
      }
    },
    "robotsTxt": { "success": false, "error": "robots.txt not found (404)" },
    "sitemap": { "success": false, "error": "sitemap.xml not found (404)" },
    "metadata": {
      "basic": {
        "title": "Example Domain",
        "description": null,
        "charset": "utf-8"
      }
    }
  },
  "logs": [...],
  "summary": {
    "totalTime": 2976,
    "successCount": 1,
    "failureCount": 2,
    "partialSuccess": true
  }
}
```

## 🎨 Design

- **Color Scheme**: Dark theme with gray-900 background
- **Accent Color**: Blue-400 for branding and interactive elements
- **Typography**: Clean, modern fonts with proper hierarchy
- **Responsive**: Mobile-first design approach
- **Consistent Styling**: Tailwind CSS classes throughout
- **Error States**: Red-themed error messages with clear contrast

## 📁 Project Structure

```
aeo-analyzer/
├── src/                            # Frontend source
│   ├── app/                        # Next.js app directory
│   └── components/                 # React components
├── api/                            # Backend source
│   ├── routes/                     # API route handlers
│   ├── services/                   # Business logic services
│   └── utils/                      # Utility functions
├── public/                         # Static assets
└── package.json                    # Dependencies & scripts
```

## 🚦 Implementation Progress

### ✅ Step 1: Homepage with Component Architecture
- Homepage with URL form, validation, and submission
- Clean component architecture following best practices
- TypeScript interfaces and proper error handling

### ✅ Step 2: Empty Report Page
- Report page with URL parameter extraction
- Comprehensive error handling (missing URL, invalid format)
- Back navigation and loading states
- Placeholder for analysis functionality

### ✅ Step 3A: Basic Backend Setup
- Fastify server with health endpoints
- CORS configuration for frontend communication
- Custom logging utility with colored output
- Graceful shutdown and error handling

### ✅ Step 3B: Data Collection Route
- Comprehensive web crawler service
- Parallel data collection (HTML, robots.txt, sitemap.xml)
- Real-time logging and progress tracking
- URL validation and metadata extraction

### ✅ Step 3C: Frontend Integration
- Complete API integration with custom React hooks
- Real-time analysis logs with auto-scroll
- Interactive data collection results with status icons
- Comprehensive error handling and retry functionality
- Analysis summary dashboard with metrics

### 🔄 Next Steps
- **Step 4**: Implement AEO analysis algorithms
- **Step 5**: Generate scoring and recommendations
- **Step 6**: Advanced reporting and export features

## 📋 Development Scripts

```bash
# Frontend development
npm run dev              # Start Next.js dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint frontend code

# Backend development  
npm run api              # Start API server (port 3001)

# Full stack development
npm run dev:full         # Start both frontend and backend (future)
```

## 🔗 Dependencies

### Frontend
- `next`: ^15.4.1
- `react`: ^19.1.0
- `react-hook-form`: ^7.60.0
- `zod`: ^4.0.5
- `@hookform/resolvers`: ^5.1.1
- `tailwindcss`: ^4

### Backend
- `fastify`: ^5.2.0
- `@fastify/cors`: ^10.1.0
- `cheerio`: ^1.0.0-rc.12

## 📚 Documentation

- [`COMPONENTS.md`](./COMPONENTS.md) - Detailed component architecture documentation
- [`STEP3A-BACKEND.md`](./STEP3A-BACKEND.md) - Backend infrastructure setup
- [`STEP3B-DATA-COLLECTION.md`](./STEP3B-DATA-COLLECTION.md) - Data collection implementation
- [`STEP3C-FRONTEND-INTEGRATION.md`](./STEP3C-FRONTEND-INTEGRATION.md) - Frontend-backend integration
- [`architecture.md`](./architecture.md) - Full application architecture specifications

## 🧪 Development

```bash
# Test backend endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/collect-data/test?url=https://example.com
curl -X POST http://localhost:3001/api/collect-data \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Frontend development
npm run dev              # Hot reload on http://localhost:3000
```

## 📝 License

This project is built for the AEO Auditor application as specified in the architecture documentation.
