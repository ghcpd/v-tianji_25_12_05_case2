import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { Task, TaskFilter, TaskStatus, TaskPriority, TaskCategory, TimeEntry } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { getNextRecurrenceDate, shouldCreateNextOccurrence, createRecurrenceInstance } from '@/utils/recurrenceUtils'

interface TaskState {
  tasks: Task[]
  filter: TaskFilter
  timeEntries: TimeEntry[]
  activeTimer: TimeEntry | null
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualHours' | 'parentTaskId' | 'isRecurrenceInstance'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'DELETE_TASK_AND_INSTANCES'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<TaskFilter> }
  | { type: 'RESET_FILTER' }
  | { type: 'START_TIMER'; payload: string }
  | { type: 'STOP_TIMER'; payload: { taskId: string; endTime: Date } }
  | { type: 'LOAD_TASKS'; payload: Task[] }
  | { type: 'ADD_RECURRENCE_INSTANCE'; payload: Task }
  | { type: 'GENERATE_RECURRING_TASKS'; payload: Task[] }

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
        actualHours: 0,
        parentTaskId: null,
        isRecurrenceInstance: false
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

    case 'DELETE_TASK_AND_INSTANCES':
      return {
        ...state,
        tasks: state.tasks.filter(task => 
          task.id !== action.payload && task.parentTaskId !== action.payload
        ),
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

    case 'ADD_RECURRENCE_INSTANCE':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      }

    case 'GENERATE_RECURRING_TASKS':
      return {
        ...state,
        tasks: [...state.tasks, ...action.payload]
      }

    default:
      return state
  }
}

interface TaskContextType {
  state: TaskState
  dispatch: React.Dispatch<TaskAction>
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualHours' | 'parentTaskId' | 'isRecurrenceInstance'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  deleteTaskAndInstances: (id: string) => void
  setFilter: (filter: Partial<TaskFilter>) => void
  resetFilter: () => void
  startTimer: (taskId: string) => void
  stopTimer: (taskId: string) => void
  generateRecurringInstances: (taskId: string, count: number) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'actualHours' | 'parentTaskId' | 'isRecurrenceInstance'>) => {
    dispatch({ type: 'ADD_TASK', payload: task })
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
  }

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id })
  }

  const deleteTaskAndInstances = (id: string) => {
    dispatch({ type: 'DELETE_TASK_AND_INSTANCES', payload: id })
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

  const generateRecurringInstances = (taskId: string, count: number) => {
    const parentTask = state.tasks.find(t => t.id === taskId)
    if (!parentTask || !parentTask.recurrence || !parentTask.recurrence.frequency) {
      return
    }

    const instances: Task[] = []
    let currentDate = parentTask.dueDate || new Date()
    let occurrenceIndex = 1

    for (let i = 0; i < count; i++) {
      currentDate = getNextRecurrenceDate(currentDate, parentTask.recurrence.frequency, parentTask.recurrence.interval)

      const shouldCreate = shouldCreateNextOccurrence(currentDate, parentTask.recurrence, occurrenceIndex)
      if (!shouldCreate) break

      const instance = createRecurrenceInstance(parentTask, currentDate, occurrenceIndex)
      instances.push(instance)
      occurrenceIndex++
    }

    if (instances.length > 0) {
      dispatch({ type: 'GENERATE_RECURRING_TASKS', payload: instances })
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
        deleteTaskAndInstances,
        setFilter,
        resetFilter,
        startTimer,
        stopTimer,
        generateRecurringInstances
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
