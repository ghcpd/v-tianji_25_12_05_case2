export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in-progress',
  Review = 'review',
  Done = 'done'
}

export enum TaskCategory {
  Development = 'development',
  Design = 'design',
  Marketing = 'marketing',
  Research = 'research',
  Documentation = 'documentation',
  Testing = 'testing'
}

export interface TaskTag {
  id: string
  name: string
  color: string
}

export interface TimeEntry {
  id: string
  taskId: string
  startTime: Date
  endTime: Date | null
  duration: number
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  category: TaskCategory
  tags: string[]
  createdAt: Date
  updatedAt: Date
  dueDate: Date | null
  estimatedHours: number | null
  actualHours: number
  assignedTo: string | null
  dependencies: string[]
  subtasks: string[]
}

export interface TaskFilter {
  status: TaskStatus | null
  priority: TaskPriority | null
  category: TaskCategory | null
  tags: string[]
  searchQuery: string
  /**
   * If true, include only overdue tasks. If false, include only non-overdue tasks. If null/undefined, ignore overdue status.
   */
  overdue?: boolean | null
  dateRange: {
    start: Date | null
    end: Date | null
  }
}

export interface TaskStats {
  total: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<TaskPriority, number>
  byCategory: Record<TaskCategory, number>
  totalEstimatedHours: number
  totalActualHours: number
  completionRate: number
  averageCompletionTime: number
}

export interface Theme {
  mode: 'light' | 'dark'
  primaryColor: string
  secondaryColor: string
}
