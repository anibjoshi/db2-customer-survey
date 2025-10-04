# Zora Customer Survey

A modern React application for collecting and visualizing customer feedback on Db2 database problems. This survey tool helps prioritize issues by allowing users to rate problems on frequency and severity scales.

## Features

- **Interactive Survey Form**: Rate 15 different Db2 problems across 4 categories
- **Priority Matrix Visualization**: Scatter plot showing frequency vs severity
- **Data Persistence**: Local storage for multiple survey responses
- **CSV Export**: Download survey data for analysis
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS and React

## Problem Categories

1. **Query Performance & Tuning** (3 problems)
2. **Incident Analysis & Resolution** (4 problems)
3. **Monitoring & Anomaly Detection** (2 problems)
4. **Maintenance & Operations** (6 problems)

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Local Storage** for data persistence
- **SVG** for custom visualizations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation (Single Command)

```bash
npm install
```

This will automatically install both frontend and backend dependencies.

### Development

**Run both frontend and backend together:**
```bash
npm run dev:all
```

**Or run separately:**
```bash
# Terminal 1 - Frontend (http://localhost:3000)
npm run dev

# Terminal 2 - Backend (http://localhost:3001)
npm run dev:server
```

### Available Scripts

- `npm install` - Install all dependencies (frontend + backend)
- `npm run dev:all` - Start both frontend and backend
- `npm run dev` - Start frontend only
- `npm run dev:server` - Start backend only
- `npm run build` - Build both frontend and backend for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Serverless Deployment (Vercel)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Vercel will automatically:
   - Detect the monorepo structure
   - Build the frontend (`dist/`)
   - Deploy the backend as serverless functions
4. Set environment variable: `VITE_API_URL` to your API URL

### Database Considerations

For serverless, you'll need to use:
- **Vercel Postgres** or **Planetscale** for production database
- Or deploy the backend separately on a VM with persistent storage

### Local Production Build

```bash
npm run build
npm start
```

Serves the app on `http://localhost:3001`

## Usage

1. **Rate Problems**: Use the sliders to rate each problem's frequency (how often it occurs) and severity (how painful it is)
2. **Add Feedback**: Use the text area to provide additional context
3. **Save Response**: Click "Save Response" to store your feedback
4. **View Results**: See the priority matrix visualization below
5. **Export Data**: Download CSV files for further analysis

## Data Storage

- All data is stored locally in your browser
- No server or database required
- Data persists between sessions
- Use "Clear All Data" to reset

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
