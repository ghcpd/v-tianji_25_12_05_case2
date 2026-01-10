import { describe, it, expect, beforeEach } from 'vitest'
import {
  getNextRecurrenceDate,
  shouldCreateNextOccurrence,
  createRecurrenceInstance,
  countRecurrenceInstances,
  getRecurrenceInstancesForParent,
  deleteRecurrenceInstances,
  isTaskRecurring,
  getRecurrenceDescription
} from '@/utils/recurrenceUtils'
import { Task, RecurrenceFrequency, RecurrenceRule, TaskStatus, TaskPriority, TaskCategory } from '@/types'

describe('recurrenceUtils', () => {
  let mockTask: Task
  let mockRecurrenceRule: RecurrenceRule

  beforeEach(() => {
    mockTask = {
      id: 'task-1',
      title: 'Weekly Standup',
      description: 'Team standup meeting',
      status: TaskStatus.Todo,
      priority: TaskPriority.Medium,
      category: TaskCategory.Development,
      tags: [],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      dueDate: new Date('2025-01-06'),
      estimatedHours: 1,
      actualHours: 0,
      assignedTo: null,
      dependencies: [],
      subtasks: [],
      recurrence: null,
      parentTaskId: null,
      isRecurrenceInstance: false
    }

    mockRecurrenceRule = {
      frequency: RecurrenceFrequency.Weekly,
      interval: 1,
      endDate: null,
      maxOccurrences: null,
      daysOfWeek: [1] // Monday
    }
  })

  describe('getNextRecurrenceDate', () => {
    it('should calculate next date for daily recurrence', () => {
      const baseDate = new Date('2025-01-06')
      const nextDate = getNextRecurrenceDate(baseDate, RecurrenceFrequency.Daily, 1)
      expect(nextDate.getDate()).toBe(7)
    })

    it('should calculate next date for weekly recurrence', () => {
      const baseDate = new Date('2025-01-06')
      const nextDate = getNextRecurrenceDate(baseDate, RecurrenceFrequency.Weekly, 1)
      expect(nextDate.getDate()).toBe(13)
    })

    it('should calculate next date for biweekly recurrence', () => {
      const baseDate = new Date('2025-01-06')
      const nextDate = getNextRecurrenceDate(baseDate, RecurrenceFrequency.Biweekly, 1)
      expect(nextDate.getDate()).toBe(20)
    })

    it('should calculate next date for monthly recurrence', () => {
      const baseDate = new Date('2025-01-06')
      const nextDate = getNextRecurrenceDate(baseDate, RecurrenceFrequency.Monthly, 1)
      expect(nextDate.getMonth()).toBe(1) // February
      expect(nextDate.getDate()).toBe(6)
    })

    it('should calculate next date for quarterly recurrence', () => {
      const baseDate = new Date('2025-01-06')
      const nextDate = getNextRecurrenceDate(baseDate, RecurrenceFrequency.Quarterly, 1)
      expect(nextDate.getMonth()).toBe(3) // April
      expect(nextDate.getDate()).toBe(6)
    })

    it('should calculate next date for yearly recurrence', () => {
      const baseDate = new Date('2025-01-06')
      const nextDate = getNextRecurrenceDate(baseDate, RecurrenceFrequency.Yearly, 1)
      expect(nextDate.getFullYear()).toBe(2026)
      expect(nextDate.getMonth()).toBe(0)
      expect(nextDate.getDate()).toBe(6)
    })

    it('should handle custom intervals', () => {
      const baseDate = new Date('2025-01-06')
      const nextDate = getNextRecurrenceDate(baseDate, RecurrenceFrequency.Weekly, 2)
      expect(nextDate.getDate()).toBe(20) // 2 weeks later
    })
  })

  describe('shouldCreateNextOccurrence', () => {
    it('should return true when all conditions are met', () => {
      const currentDate = new Date('2025-01-13')
      const result = shouldCreateNextOccurrence(currentDate, mockRecurrenceRule, 1)
      expect(result).toBe(true)
    })

    it('should return false when max occurrences reached', () => {
      const rule = { ...mockRecurrenceRule, maxOccurrences: 1 }
      const currentDate = new Date('2025-01-13')
      const result = shouldCreateNextOccurrence(currentDate, rule, 2)
      expect(result).toBe(false)
    })

    it('should return false when past end date', () => {
      const rule = { ...mockRecurrenceRule, endDate: new Date('2025-01-10') }
      const currentDate = new Date('2025-01-13')
      const result = shouldCreateNextOccurrence(currentDate, rule, 1)
      expect(result).toBe(false)
    })

    it('should return false when frequency is null', () => {
      const rule = { ...mockRecurrenceRule, frequency: null }
      const currentDate = new Date('2025-01-13')
      const result = shouldCreateNextOccurrence(currentDate, rule, 1)
      expect(result).toBe(false)
    })

    it('should check day of week when specified', () => {
      const rule = { ...mockRecurrenceRule, daysOfWeek: [1] } // Monday
      // 2025-01-13 is a Monday
      const mondayDate = new Date('2025-01-13')
      expect(shouldCreateNextOccurrence(mondayDate, rule, 1)).toBe(true)

      // 2025-01-14 is a Tuesday
      const tuesdayDate = new Date('2025-01-14')
      expect(shouldCreateNextOccurrence(tuesdayDate, rule, 1)).toBe(false)
    })
  })

  describe('createRecurrenceInstance', () => {
    it('should create a new task instance with same properties', () => {
      const nextDate = new Date('2025-01-13')
      const instance = createRecurrenceInstance(mockTask, nextDate, 1)

      expect(instance.title).toContain(mockTask.title)
      expect(instance.priority).toBe(mockTask.priority)
      expect(instance.category).toBe(mockTask.category)
    })

    it('should set parent task id and recurrence flag', () => {
      const nextDate = new Date('2025-01-13')
      const instance = createRecurrenceInstance(mockTask, nextDate, 1)

      expect(instance.parentTaskId).toBe(mockTask.id)
      expect(instance.isRecurrenceInstance).toBe(true)
    })

    it('should set new due date', () => {
      const nextDate = new Date('2025-01-13')
      const instance = createRecurrenceInstance(mockTask, nextDate, 1)

      expect(instance.dueDate).toEqual(nextDate)
    })

    it('should generate unique id', () => {
      const nextDate = new Date('2025-01-13')
      const instance1 = createRecurrenceInstance(mockTask, nextDate, 1)
      const instance2 = createRecurrenceInstance(mockTask, nextDate, 2)

      expect(instance1.id).not.toBe(instance2.id)
      expect(instance1.id).not.toBe(mockTask.id)
    })

    it('should reset actualHours to 0', () => {
      mockTask.actualHours = 5
      const nextDate = new Date('2025-01-13')
      const instance = createRecurrenceInstance(mockTask, nextDate, 1)

      expect(instance.actualHours).toBe(0)
    })

    it('should include occurrence index in title', () => {
      const nextDate = new Date('2025-01-13')
      const instance = createRecurrenceInstance(mockTask, nextDate, 5)

      expect(instance.title).toContain('5')
    })
  })

  describe('countRecurrenceInstances', () => {
    it('should count recurrence instances for a parent task', () => {
      const tasks: Task[] = [
        mockTask,
        { ...mockTask, id: 'instance-1', parentTaskId: 'task-1', isRecurrenceInstance: true },
        { ...mockTask, id: 'instance-2', parentTaskId: 'task-1', isRecurrenceInstance: true },
        { ...mockTask, id: 'task-2', parentTaskId: null, isRecurrenceInstance: false }
      ]

      const count = countRecurrenceInstances(tasks, 'task-1')
      expect(count).toBe(2)
    })

    it('should return 0 when no instances exist', () => {
      const tasks: Task[] = [mockTask]
      const count = countRecurrenceInstances(tasks, 'task-1')
      expect(count).toBe(0)
    })
  })

  describe('getRecurrenceInstancesForParent', () => {
    it('should return all instances for a parent task', () => {
      const tasks: Task[] = [
        mockTask,
        { ...mockTask, id: 'instance-1', parentTaskId: 'task-1', isRecurrenceInstance: true },
        { ...mockTask, id: 'instance-2', parentTaskId: 'task-1', isRecurrenceInstance: true },
        { ...mockTask, id: 'task-2', parentTaskId: null, isRecurrenceInstance: false }
      ]

      const instances = getRecurrenceInstancesForParent(tasks, 'task-1')
      expect(instances.length).toBe(2)
      expect(instances.every(t => t.parentTaskId === 'task-1')).toBe(true)
    })

    it('should return empty array when no instances exist', () => {
      const tasks: Task[] = [mockTask]
      const instances = getRecurrenceInstancesForParent(tasks, 'task-1')
      expect(instances).toHaveLength(0)
    })
  })

  describe('deleteRecurrenceInstances', () => {
    it('should remove all instances for a parent task', () => {
      const tasks: Task[] = [
        mockTask,
        { ...mockTask, id: 'instance-1', parentTaskId: 'task-1', isRecurrenceInstance: true },
        { ...mockTask, id: 'instance-2', parentTaskId: 'task-1', isRecurrenceInstance: true },
        { ...mockTask, id: 'task-2', parentTaskId: null, isRecurrenceInstance: false }
      ]

      const result = deleteRecurrenceInstances(tasks, 'task-1')
      expect(result.length).toBe(2) // Parent task and task-2
      expect(result.some(t => t.id === 'task-1')).toBe(true)
      expect(result.some(t => t.id === 'task-2')).toBe(true)
      expect(result.every(t => t.parentTaskId !== 'task-1')).toBe(true)
    })

    it('should not affect other tasks and their instances', () => {
      const tasks: Task[] = [
        mockTask,
        { ...mockTask, id: 'instance-1', parentTaskId: 'task-1', isRecurrenceInstance: true },
        { ...mockTask, id: 'task-2', parentTaskId: null, isRecurrenceInstance: false },
        { ...mockTask, id: 'instance-2b', parentTaskId: 'task-2', isRecurrenceInstance: true }
      ]

      const result = deleteRecurrenceInstances(tasks, 'task-1')
      expect(result.length).toBe(3) // task-1, task-2, and instance-2b
      expect(result.some(t => t.id === 'task-1')).toBe(true)
      expect(result.some(t => t.id === 'task-2')).toBe(true)
      expect(result.some(t => t.id === 'instance-2b')).toBe(true)
      expect(result.every(t => t.parentTaskId !== 'task-1')).toBe(true)
    })
  })

  describe('isTaskRecurring', () => {
    it('should return true for task with recurrence', () => {
      const task = { ...mockTask, recurrence: mockRecurrenceRule }
      expect(isTaskRecurring(task)).toBe(true)
    })

    it('should return false for task without recurrence', () => {
      expect(isTaskRecurring(mockTask)).toBe(false)
    })

    it('should return false when recurrence is null', () => {
      const task = { ...mockTask, recurrence: null }
      expect(isTaskRecurring(task)).toBe(false)
    })

    it('should return false when frequency is null', () => {
      const task = { ...mockTask, recurrence: { ...mockRecurrenceRule, frequency: null } }
      expect(isTaskRecurring(task)).toBe(false)
    })
  })

  describe('getRecurrenceDescription', () => {
    it('should return "No recurrence" when frequency is null', () => {
      const rule = { ...mockRecurrenceRule, frequency: null }
      const description = getRecurrenceDescription(rule)
      expect(description).toBe('No recurrence')
    })

    it('should include frequency in description', () => {
      const rule = { ...mockRecurrenceRule, frequency: RecurrenceFrequency.Daily }
      const description = getRecurrenceDescription(rule)
      expect(description).toContain('Daily')
    })

    it('should include interval in description when greater than 1', () => {
      const rule = { ...mockRecurrenceRule, interval: 2 }
      const description = getRecurrenceDescription(rule)
      expect(description).toContain('every 2')
    })

    it('should include max occurrences when set', () => {
      const rule = { ...mockRecurrenceRule, maxOccurrences: 5 }
      const description = getRecurrenceDescription(rule)
      expect(description).toContain('5 occurrences')
    })

    it('should include end date when set', () => {
      const endDate = new Date('2025-12-31')
      const rule = { ...mockRecurrenceRule, endDate }
      const description = getRecurrenceDescription(rule)
      expect(description).toContain('until')
      expect(description).toContain('12/31/2025')
    })

    it('should handle all attributes together', () => {
      const endDate = new Date('2025-12-31')
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 2,
        endDate,
        maxOccurrences: 10,
        daysOfWeek: [1]
      }
      const description = getRecurrenceDescription(rule)
      expect(description).toContain('Weekly')
      expect(description).toContain('every 2')
      expect(description).toContain('10 occurrences')
      expect(description).toContain('until')
    })
  })
})
