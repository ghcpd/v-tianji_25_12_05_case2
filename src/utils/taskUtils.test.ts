import { describe, it, expect } from 'vitest'
import { isTaskOverdue, filterTasks } from './taskUtils'
import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types'

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test',
  description: 'desc',
  status: TaskStatus.Todo,
  priority: TaskPriority.Medium,
  category: TaskCategory.Development,
  tags: [],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  dueDate: null,
  estimatedHours: null,
  actualHours: 0,
  assignedTo: null,
  dependencies: [],
  subtasks: [],
  ...overrides
})

describe('isTaskOverdue', () => {
  it('returns false for tasks without dueDate', () => {
    const t = makeTask({ dueDate: null })
    expect(isTaskOverdue(t, new Date('2025-02-01'))).toBe(false)
  })

  it('returns true for past due date and not done', () => {
    const t = makeTask({ dueDate: new Date('2025-01-01'), status: TaskStatus.Todo })
    expect(isTaskOverdue(t, new Date('2025-02-01'))).toBe(true)
  })

  it('returns false for due today', () => {
    const t = makeTask({ dueDate: new Date('2025-02-01') })
    expect(isTaskOverdue(t, new Date('2025-02-01'))).toBe(false)
  })

  it('returns false for done tasks even if past due', () => {
    const t = makeTask({ dueDate: new Date('2025-01-01'), status: TaskStatus.Done })
    expect(isTaskOverdue(t, new Date('2025-02-01'))).toBe(false)
  })
})

describe('filterTasks overdue', () => {
  it('filters to only overdue tasks when filter.overdue === true', () => {
    const tasks = [
      makeTask({ id: 'a', dueDate: new Date('2025-01-01') }),
      // set this far-future date so it's not overdue on 2025-12-05
      makeTask({ id: 'b', dueDate: new Date('2026-03-01') }),
      makeTask({ id: 'c', dueDate: null })
    ]
    const filtered = filterTasks(tasks, {
      status: null,
      priority: null,
      category: null,
      tags: [],
      searchQuery: '',
      dateRange: { start: null, end: null },
      overdue: true
    })
    expect(filtered.map(t => t.id)).toEqual(['a'])
  })

  it('filters out overdue tasks when filter.overdue === false', () => {
    const tasks = [
      makeTask({ id: 'a', dueDate: new Date('2025-01-01') }),
      makeTask({ id: 'b', dueDate: new Date('2026-03-01') }),
      makeTask({ id: 'c', dueDate: null })
    ]
    const filtered = filterTasks(tasks, {
      status: null,
      priority: null,
      category: null,
      tags: [],
      searchQuery: '',
      dateRange: { start: null, end: null },
      overdue: false
    })
    expect(filtered.map(t => t.id)).toEqual(['b', 'c'])
  })
})
