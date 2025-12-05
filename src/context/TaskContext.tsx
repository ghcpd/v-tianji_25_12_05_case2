import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Task, TaskFilter, TaskStatus, TaskPriority, TaskCategory, TimeEntry } from '@/types'
import { v4 as uuidv4 } from 'uuid'

interface TaskState {
  tasks: Task[]
  filter: TaskFilter
  timeEntries: TimeEntry[]
  activeTimer: TimeEntry | null
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualHours'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<TaskFilter> }
  | { type: 'RESET_FILTER' }
  | { type: 'START_TIMER'; payload: string }
  | { type: 'STOP_TIMER'; payload: { taskId: string; endTime: Date } }
  | { type: 'LOAD_TASKS'; payload: Task[] }

const initialState: TaskState = {
  tasks: [],
  filter: {
    status: null,
    priority: null,
    category: null,
    tags: [],
    searchQuery: '',
    dateRange: { start: null, end: null }
  },
  timeEntries: [],
  activeTimer: null
}

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'ADD_TASK':
      const newTask: Task = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        actualHours: 0
      }
      return { ...state, tasks: [...state.tasks, newTask] }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date() }
            : task
        )
      }

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        timeEntries: state.timeEntries.filter(entry => entry.taskId !== action.payload)
      }

    case 'SET_FILTER':
      return {
        ...state,
        filter: { ...state.filter, ...action.payload }
      }

    case 'RESET_FILTER':
      return {
        ...state,
        filter: initialState.filter
      }

    case 'START_TIMER':
      const newTimer: TimeEntry = {
        id: uuidv4(),
        taskId: action.payload,
        startTime: new Date(),
        endTime: null,
        duration: 0
      }
      return {
        ...state,
        activeTimer: newTimer,
        timeEntries: [...state.timeEntries, newTimer]
      }

    case 'STOP_TIMER':
      const hours = (action.payload.endTime.getTime() - (state.activeTimer?.startTime.getTime() || 0)) / (1000 * 60 * 60)
      const updatedEntries = state.timeEntries.map(entry =>
        entry.id === state.activeTimer?.id
          ? { ...entry, endTime: action.payload.endTime, duration: hours }
          : entry
      )
      const updatedTasks = state.tasks.map(task =>
        task.id === action.payload.taskId
          ? { ...task, actualHours: task.actualHours + hours }
          : task
      )
      return {
        ...state,
        timeEntries: updatedEntries,
        tasks: updatedTasks,
        activeTimer: null
      }

    case 'LOAD_TASKS':
      return { ...state, tasks: action.payload }

    default:
      return state
  }
}

interface TaskContextType {
  state: TaskState
  dispatch: React.Dispatch<TaskAction>
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualHours'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  setFilter: (filter: Partial<TaskFilter>) => void
  resetFilter: () => void
  startTimer: (taskId: string) => void
  stopTimer: (taskId: string) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualHours'>) => {
    dispatch({ type: 'ADD_TASK', payload: task })
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
  }

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id })
  }

  const setFilter = (filter: Partial<TaskFilter>) => {
    dispatch({ type: 'SET_FILTER', payload: filter })
  }

  const resetFilter = () => {
    dispatch({ type: 'RESET_FILTER' })
  }

  const startTimer = (taskId: string) => {
    if (state.activeTimer) {
      stopTimer(state.activeTimer.taskId)
    }
    dispatch({ type: 'START_TIMER', payload: taskId })
  }

  const stopTimer = (taskId: string) => {
    if (state.activeTimer && state.activeTimer.taskId === taskId) {
      dispatch({ type: 'STOP_TIMER', payload: { taskId, endTime: new Date() } })
    }
  }

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        addTask,
        updateTask,
        deleteTask,
        setFilter,
        resetFilter,
        startTimer,
        stopTimer
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider')
  }
  return context
}
