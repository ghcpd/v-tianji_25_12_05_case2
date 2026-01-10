import { Task, RecurrenceRule, RecurrenceFrequency } from '@/types'
import { 
  addDays, 
  addWeeks, 
  addMonths, 
  addQuarters, 
  addYears, 
  startOfDay,
  isBefore,
  isAfter,
  getDay
} from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

export const getNextRecurrenceDate = (
  currentDate: Date,
  frequency: RecurrenceFrequency,
  interval: number = 1
): Date => {
  let nextDate: Date

  switch (frequency) {
    case RecurrenceFrequency.Daily:
      nextDate = addDays(currentDate, interval)
      break
    case RecurrenceFrequency.Weekly:
      nextDate = addWeeks(currentDate, interval)
      break
    case RecurrenceFrequency.Biweekly:
      nextDate = addWeeks(currentDate, interval * 2)
      break
    case RecurrenceFrequency.Monthly:
      nextDate = addMonths(currentDate, interval)
      break
    case RecurrenceFrequency.Quarterly:
      nextDate = addQuarters(currentDate, interval)
      break
    case RecurrenceFrequency.Yearly:
      nextDate = addYears(currentDate, interval)
      break
    default:
      nextDate = currentDate
  }

  return startOfDay(nextDate)
}

export const shouldCreateNextOccurrence = (
  currentDate: Date,
  recurrence: RecurrenceRule,
  occurrenceCount: number
): boolean => {
  if (!recurrence.frequency) return false

  // Check if max occurrences reached
  if (recurrence.maxOccurrences && occurrenceCount >= recurrence.maxOccurrences) {
    return false
  }

  // Check if past end date
  if (recurrence.endDate && isAfter(currentDate, recurrence.endDate)) {
    return false
  }

  // Check day of week if specified
  if (recurrence.daysOfWeek.length > 0) {
    const dayOfWeek = getDay(currentDate)
    if (!recurrence.daysOfWeek.includes(dayOfWeek)) {
      return false
    }
  }

  return true
}

export const createRecurrenceInstance = (
  parentTask: Task,
  nextDueDate: Date,
  occurrenceIndex: number
): Task => {
  return {
    ...parentTask,
    id: uuidv4(),
    dueDate: nextDueDate,
    createdAt: new Date(),
    updatedAt: new Date(),
    actualHours: 0,
    parentTaskId: parentTask.id,
    isRecurrenceInstance: true,
    title: `${parentTask.title} (${occurrenceIndex})`
  }
}

export const countRecurrenceInstances = (
  tasks: Task[],
  parentTaskId: string
): number => {
  return tasks.filter(task => task.parentTaskId === parentTaskId).length
}

export const getRecurrenceInstancesForParent = (
  tasks: Task[],
  parentTaskId: string
): Task[] => {
  return tasks.filter(task => task.parentTaskId === parentTaskId)
}

export const deleteRecurrenceInstances = (
  tasks: Task[],
  parentTaskId: string
): Task[] => {
  return tasks.filter(task => task.parentTaskId !== parentTaskId)
}

export const isTaskRecurring = (task: Task): boolean => {
  return task.recurrence !== null && task.recurrence.frequency !== null
}

export const getRecurrenceDescription = (recurrence: RecurrenceRule): string => {
  if (!recurrence.frequency) return 'No recurrence'

  const frequencyText = recurrence.frequency.charAt(0).toUpperCase() + recurrence.frequency.slice(1)
  const intervalText = recurrence.interval > 1 ? ` every ${recurrence.interval}` : ''

  let description = `${frequencyText}${intervalText}`

  if (recurrence.maxOccurrences) {
    description += ` (up to ${recurrence.maxOccurrences} occurrences)`
  }

  if (recurrence.endDate) {
    const endDateStr = recurrence.endDate.toLocaleDateString()
    description += ` until ${endDateStr}`
  }

  return description
}
