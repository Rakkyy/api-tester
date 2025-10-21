# API Tester

A modern, professional API testing tool built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **HTTP Methods**: Support for GET, POST, PUT, DELETE, and PATCH requests
- **Request Configuration**:
  - URL input with query parameter builder
  - Custom headers management
  - JSON request body editor
- **CORS Proxy**: Built-in Next.js API route to avoid CORS issues
- **Response Display**:
  - Syntax-highlighted JSON responses
  - Collapsible response body and headers
  - HTTP status codes with color-coded indicators
  - Request/response timing in milliseconds
- **Request Management**:
  - Auto-save requests to localStorage
  - Sidebar showing last 20 saved requests
  - Load and edit saved requests
  - Delete unwanted requests
- **Professional UI**: Dark theme inspired by VS Code and Postman
- **Fully Responsive**:
  - Mobile-first design with hamburger menu
  - Vertical layout on small/medium screens (request panel on top, response on bottom)
  - Side-by-side layout on large screens
  - Touch-friendly controls and optimized spacing

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal)

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Enter URL**: Type or paste your API endpoint URL
2. **Select Method**: Choose HTTP method (GET, POST, PUT, DELETE, PATCH)
3. **Add Query Params**: Switch to "Query Params" tab to add key-value pairs
4. **Add Headers**: Switch to "Headers" tab to configure request headers
5. **Add Body**: For POST/PUT/PATCH, switch to "Body" tab to add JSON payload
6. **Send Request**: Click "Send" button or press Enter in URL field
7. **View Response**: See formatted response with status, timing, and data
8. **Access History**: Click on saved requests in the sidebar to reload them

## Project Structure

```
postman-app/
├── app/
│   ├── api/request/route.ts  # Proxy API route for CORS handling
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main application page
│   └── globals.css           # Global styles
├── components/
│   ├── KeyValueInput.tsx     # Reusable key-value pair input
│   ├── ResponsePanel.tsx     # Response display with syntax highlighting
│   └── Sidebar.tsx           # Saved requests sidebar
├── types/
│   └── index.ts              # TypeScript type definitions
└── [config files]
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **react-syntax-highlighter**: Syntax highlighting for JSON responses

## License

MIT
