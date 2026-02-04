import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TaskProvider } from '../context/TaskContext'
import { TaskBoard } from './TaskBoard'
import { TaskForm } from './TaskForm'
import { Dashboard } from './Dashboard'
import { FilterPanel } from './FilterPanel'
import { TimeTracker } from './TimeTracker'
import { Task } from '../types'
import './App.css'

type View = 'board' | 'dashboard'

export const App: React.FC = () => {
  const [view, setView] = useState<View>('board')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setShowTaskForm(true)
  }

  const handleCreateTask = () => {
    setSelectedTask(undefined)
    setShowTaskForm(true)
  }

  const handleCloseForm = () => {
    setShowTaskForm(false)
    setSelectedTask(undefined)
  }

  return (
    <TaskProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="app">
          <header className="app-header">
            <h1 className="app-title">Advanced Task Manager</h1>
            <nav className="app-nav">
              <button
                className={view === 'board' ? 'active' : ''}
                onClick={() => setView('board')}
              >
                Board
              </button>
              <button
                className={view === 'dashboard' ? 'active' : ''}
                onClick={() => setView('dashboard')}
              >
                Dashboard
              </button>
            </nav>
            <button className="create-button" onClick={handleCreateTask}>
              + New Task
            </button>
          </header>
          <div className="app-content">
            {view === 'board' && (
              <div className="board-view">
                <div className="sidebar">
                  <FilterPanel />
                  <TimeTracker />
                </div>
                <div className="main-content">
                  <TaskBoard onTaskClick={handleTaskClick} />
                </div>
              </div>
            )}
            {view === 'dashboard' && <Dashboard />}
          </div>
          {showTaskForm && (
            <TaskForm task={selectedTask} onClose={handleCloseForm} />
          )}
        </div>
      </DndProvider>
    </TaskProvider>
  )
}
