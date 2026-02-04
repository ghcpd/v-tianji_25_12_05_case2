# Advanced Task Manager

A sophisticated task management application built with React, TypeScript, and modern web technologies.

## Features

- **Task Management**: Create, update, and delete tasks with rich metadata
- **Kanban Board**: Drag-and-drop task organization across status columns
- **Advanced Filtering**: Filter tasks by status, priority, category, tags, and date range
- **Advanced Filtering**: Filter tasks by status, priority, category, tags, date range, and overdue status
- **Time Tracking**: Track time spent on tasks with start/stop timer functionality
- **Data Visualization**: Comprehensive dashboard with charts and statistics
- **Task Dependencies**: Support for task dependencies and subtasks
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- React 18
- TypeScript
- Vite
- React DnD (Drag and Drop)
- Recharts (Data Visualization)
- date-fns (Date Utilities)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Testing

Unit tests are provided for utility logic (Vitest):

```bash
npm install
npm test
```

Test file: `src/utils/taskUtils.test.ts` validates overdue detection and filter behavior.

## Project Structure

```
src/
├── components/       # React components
├── context/         # React Context for state management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── main.tsx         # Application entry point
```

## Key Components

- **TaskBoard**: Kanban-style board with drag-and-drop
- **TaskCard**: Individual task display component
- **TaskForm**: Create/edit task modal
- **Dashboard**: Analytics and visualization
- **FilterPanel**: Advanced filtering controls
- **TimeTracker**: Time tracking interface
