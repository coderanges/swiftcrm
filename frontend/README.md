# SwiftCRM Frontend

This is the React-based frontend for the SwiftCRM application.

## Features

- Modern UI built with React and TypeScript
- Responsive design using Bootstrap
- State management with React Context API
- API integration with axios
- Form handling with Formik and Yup
- Charts and data visualization with Chart.js

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- SwiftCRM backend server running

### Installation

1. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

2. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

3. Build for production:
   ```
   npm run build
   ```
   or
   ```
   yarn build
   ```

## Project Structure

- `/src` - All source code
  - `/components` - Reusable UI components
  - `/pages` - Page components for different routes
  - `/context` - React Context API for state management
  - `/services` - API services and utilities
  - `/types` - TypeScript type definitions

## API Integration

The frontend communicates with the Flask backend using RESTful API endpoints. The base URL is configured in the `.env` file.

## Authentication

User authentication is handled through Flask sessions. The frontend stores user information in the React Context API and manages login/logout operations.

## License

This project is licensed under the MIT License. 