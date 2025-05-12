# Story App

A Single-Page Application (SPA) for sharing stories with location data, built using the Story API from Dicoding.

## Features

- View stories in a grid layout
- Add new stories with photos and location
- Interactive map for selecting story locations
- Responsive design with dark mode support
- Accessibility features including skip links and semantic HTML
- Smooth page transitions using View Transition API

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Open your browser and navigate to `(https://story-app-9d775.web.app)`

## Building for Production

To create a production build:
```bash
npm run build
```

## Project Structure

- `src/index.js` - Main application logic using MVP pattern
- `src/styles.css` - Application styles
- `src/index.html` - HTML template with semantic structure
- `webpack.config.js` - Webpack configuration
- `package.json` - Project dependencies and scripts

## API Documentation

The application uses the Story API from Dicoding. For more information about the API endpoints and usage, refer to the [Story API Documentation](https://story-api.dicoding.dev/v1).

## Accessibility Features

- Skip to content link
- Semantic HTML structure
- Proper form labeling
- Alt text for images
- Keyboard navigation support

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Leaflet.js for maps
- Webpack for bundling
- View Transition API for smooth transitions 
