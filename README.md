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

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zora-customer-survey
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically on every push

### Netlify

1. Push your code to GitHub
2. Connect your repository to [Netlify](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder to your web server

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
