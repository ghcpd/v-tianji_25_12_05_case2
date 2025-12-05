import { format, differenceInHours, differenceInDays, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns'

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd HH:mm')
}

export const formatDateShort = (date: Date): string => {
  return format(date, 'MMM dd, yyyy')
}

export const calculateDuration = (start: Date, end: Date | null): number => {
  if (!end) return 0
  return differenceInHours(end, start)
}

export const isOverdue = (dueDate: Date | null): boolean => {
  if (!dueDate) return false
  return isBefore(dueDate, new Date())
}

export const isDueSoon = (dueDate: Date | null, days: number = 3): boolean => {
  if (!dueDate) return false
  const now = new Date()
  const daysUntilDue = differenceInDays(dueDate, now)
  return daysUntilDue >= 0 && daysUntilDue <= days
}

export const getDateRange = (start: Date | null, end: Date | null) => {
  if (!start || !end) return null
  return {
    start: startOfDay(start),
    end: endOfDay(end)
  }
}
