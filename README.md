# Bronx360 - Local Issue Reporting System

A full-stack web application for reporting and tracking local issues in the Bronx, built with free and open-source technologies.

## Features

- Interactive map interface using OpenStreetMap
- Report submission with photo upload
- Report tracking with unique IDs
- Admin interface for status updates
- Responsive design for all devices

## Tech Stack

- Frontend: React, Leaflet (OpenStreetMap)
- Backend: Node.js, Express
- Database: SQLite
- File Storage: Local filesystem

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd bronx360
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Start the development servers:

```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm start
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
bronx360/
├── frontend/           # React frontend application
├── backend/           # Node.js/Express backend
│   ├── data/         # SQLite database and uploaded files
│   └── src/          # Backend source code
└── README.md
```

## API Endpoints

- `POST /api/reports` - Create a new report
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get a specific report
- `PUT /api/reports/:id` - Update report status
- `POST /api/upload` - Upload report photo

## License

MIT License - Feel free to use and modify for your needs. 