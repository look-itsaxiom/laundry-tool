# Laundry Tool 🧺

A web application to help track your laundry rotation through different stages. Built with TypeScript, React, and Express.

## Features

- **Drag & Drop Interface**: Intuitive swim lanes for tracking laundry status
- **Four Stages**: Queue, In Washer, In Dryer, and Fold Ready
- **Smart Constraints**: 
  - Queue lane supports multiple items with reorderable positions
  - Washer, Dryer, and Fold Ready lanes support only one item at a time
- **CRUD Operations**: Create, update, and delete laundry cards
- **Persistent Storage**: Backend API with SQLite database

## Tech Stack

### Frontend
- React with TypeScript
- @dnd-kit for drag-and-drop functionality
- CSS3 for styling

### Backend
- Express.js with TypeScript
- SQLite with better-sqlite3
- RESTful API

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/look-itsaxiom/laundry-tool.git
cd laundry-tool
```

2. Install and start the backend:
```bash
cd backend
npm install
npm run dev
```
The backend will run on `http://localhost:3001`

3. In a new terminal, install and start the frontend:
```bash
cd frontend
npm install
npm start
```
The frontend will run on `http://localhost:3000`

## Usage

1. **Add Laundry**: Click the "+ Add Laundry" button to create a new laundry card
2. **Move Cards**: Drag cards between lanes to track progress
3. **Reorder in Queue**: Drag cards within the Queue lane to change their order
4. **Delete Cards**: Click the × button on any card to remove it

## API Endpoints

- `GET /api/cards` - Get all cards
- `POST /api/cards` - Create a new card
- `PATCH /api/cards/:id` - Update a card
- `DELETE /api/cards/:id` - Delete a card
- `POST /api/cards/reorder` - Batch update card positions

## Project Structure

```
laundry-tool/
├── backend/
│   ├── src/
│   │   ├── index.ts       # Express server
│   │   ├── database.ts    # SQLite setup
│   │   └── types.ts       # TypeScript types
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx        # Main app component
│   │   ├── api.ts         # API client
│   │   └── types.ts       # TypeScript types
│   └── package.json
└── README.md
```

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```
The optimized production build will be in the `frontend/build` directory.

## License

ISC
