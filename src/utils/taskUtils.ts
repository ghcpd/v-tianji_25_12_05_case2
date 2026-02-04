import { Task, TaskStatus, TaskPriority, TaskCategory, TaskFilter, TaskStats } from '@/types'
import { differenceInHours } from 'date-fns'
import { isBefore, startOfDay } from 'date-fns'

export const filterTasks = (tasks: Task[], filter: TaskFilter): Task[] => {
  return tasks.filter(task => {
    if (filter.status && task.status !== filter.status) return false
    if (filter.priority && task.priority !== filter.priority) return false
    if (filter.category && task.category !== filter.category) return false
    if (filter.tags.length > 0 && !filter.tags.some(tag => task.tags.includes(tag))) return false
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(query)
      const matchesDescription = task.description.toLowerCase().includes(query)
      if (!matchesTitle && !matchesDescription) return false
    }
    if (filter.dateRange.start || filter.dateRange.end) {
      if (filter.dateRange.start && task.createdAt < filter.dateRange.start) return false
      if (filter.dateRange.end && task.createdAt > filter.dateRange.end) return false
    }

    // overdue filter: when true include only overdue tasks, when false include only non-overdue tasks
    if (filter.overdue !== undefined && filter.overdue !== null) {
      const now = startOfDay(new Date())
      const taskDue = task.dueDate ? startOfDay(task.dueDate) : null
      const isOverdue = taskDue ? isBefore(taskDue, now) && task.status !== TaskStatus.Done : false
      if (filter.overdue && !isOverdue) return false
      if (!filter.overdue && isOverdue) return false
    }
    return true
  })
}

export const isTaskOverdue = (task: Task, now: Date = new Date()): boolean => {
  if (!task.dueDate) return false
  const dueDay = startOfDay(task.dueDate)
  const today = startOfDay(now)
  return isBefore(dueDay, today) && task.status !== TaskStatus.Done
}

export const sortTasks = (tasks: Task[], sortBy: 'priority' | 'date' | 'title' | 'status'): Task[] => {
  const sorted = [...tasks]
  const priorityOrder = {
    [TaskPriority.Critical]: 4,
    [TaskPriority.High]: 3,
    [TaskPriority.Medium]: 2,
    [TaskPriority.Low]: 1
  }
  const statusOrder = {
    [TaskStatus.Todo]: 1,
    [TaskStatus.InProgress]: 2,
    [TaskStatus.Review]: 3,
    [TaskStatus.Done]: 4
  }

  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'date':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      case 'status':
        return statusOrder[a.status] - statusOrder[b.status]
      default:
        return 0
    }
  })
  return sorted
}

export const calculateTaskStats = (tasks: Task[]): TaskStats => {
  const stats: TaskStats = {
    total: tasks.length,
    byStatus: {
      [TaskStatus.Todo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Review]: 0,
      [TaskStatus.Done]: 0
    },
    byPriority: {
      [TaskPriority.Low]: 0,
      [TaskPriority.Medium]: 0,
      [TaskPriority.High]: 0,
      [TaskPriority.Critical]: 0
    },
    byCategory: {
      [TaskCategory.Development]: 0,
      [TaskCategory.Design]: 0,
      [TaskCategory.Marketing]: 0,
      [TaskCategory.Research]: 0,
      [TaskCategory.Documentation]: 0,
      [TaskCategory.Testing]: 0
    },
    totalEstimatedHours: 0,
    totalActualHours: 0,
    completionRate: 0,
    averageCompletionTime: 0
  }

  let completedTasks = 0
  let totalCompletionTime = 0

  tasks.forEach(task => {
    stats.byStatus[task.status]++
    stats.byPriority[task.priority]++
    stats.byCategory[task.category]++
    if (task.estimatedHours) {
      stats.totalEstimatedHours += task.estimatedHours
    }
    stats.totalActualHours += task.actualHours

    if (task.status === TaskStatus.Done) {
      completedTasks++
      const completionTime = differenceInHours(task.updatedAt, task.createdAt)
      totalCompletionTime += completionTime
    }
  })

  stats.completionRate = stats.total > 0 ? (completedTasks / stats.total) * 100 : 0
  stats.averageCompletionTime = completedTasks > 0 ? totalCompletionTime / completedTasks : 0

  return stats
}

export const getTaskProgress = (task: Task, allTasks: Task[]): number => {
  if (task.subtasks.length === 0) {
    return task.status === TaskStatus.Done ? 100 : 0
  }
  const subtasks = allTasks.filter(t => task.subtasks.includes(t.id))
  const completedSubtasks = subtasks.filter(t => t.status === TaskStatus.Done).length
  return subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0
}
