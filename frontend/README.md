# ADHD Speech Detection Frontend

A modern, responsive React frontend for the ADHD Speech Detection API built with Tailwind CSS.

## Features

- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 📁 **Drag & Drop Upload** - Intuitive file upload with drag-and-drop support
- 📊 **Rich Results Display** - Comprehensive analysis results with visual indicators
- 🔄 **Real-time Feedback** - Loading states and error handling
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🎯 **User-Friendly** - Age selection and clear instructions

## Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Fetch API** - Modern HTTP client for API calls

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Running FastAPI backend (see main README)

### Installation

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## API Integration

The frontend communicates with the FastAPI backend running on `http://localhost:8000`. Make sure the backend is running before using the frontend.

### API Endpoints Used

- `GET /health` - Health check
- `POST /analyze` - Audio analysis with file upload

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # Main HTML template
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/
│   │   ├── Header.js       # App header with branding
│   │   ├── FileUpload.js   # File upload component with drag-drop
│   │   ├── AnalysisResults.js # Results display component
│   │   └── Footer.js       # App footer
│   ├── App.js              # Main app component
│   ├── App.css             # Global styles and Tailwind imports
│   └── index.js            # App entry point
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

## Features Overview

### File Upload
- Drag and drop interface
- File validation (type, size)
- Progress feedback
- Age selection for analysis

### Results Display
- Probability visualization
- Classification results
- Confidence indicators
- Detailed feature breakdown
- Speech transcription
- Actionable recommendations

### Error Handling
- Network error display
- File validation errors
- API error messages
- User-friendly error states

## Customization

### Styling
The app uses Tailwind CSS for styling. Colors and themes can be customized in `tailwind.config.js`.

### API Configuration
Update the API base URL in the components if the backend runs on a different port:

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style
2. Test on multiple browsers
3. Ensure responsive design works on mobile
4. Add proper error handling

## License

This project is part of the ADHD Speech Detection research tool.