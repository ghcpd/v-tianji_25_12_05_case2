import { describe, test, expect } from 'vitest'
import { filterTasks } from '../taskUtils'
import { TaskPriority, TaskStatus, TaskCategory } from '@/types'

describe('filterTasks - tag filtering', () => {
  const tasks = [
    {
      id: '1',
      title: 'Task A',
      description: 'First',
      status: TaskStatus.Todo,
      priority: TaskPriority.Medium,
      category: TaskCategory.Development,
      tags: ['frontend', 'ui'],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      dueDate: null,
      estimatedHours: null,
      actualHours: 0,
      assignedTo: null,
      dependencies: [],
      subtasks: []
    },
    {
      id: '2',
      title: 'Task B',
      description: 'Second',
      status: TaskStatus.Todo,
      priority: TaskPriority.Low,
      category: TaskCategory.Design,
      tags: ['ux', 'ui'],
      createdAt: new Date('2025-02-01'),
      updatedAt: new Date('2025-02-01'),
      dueDate: null,
      estimatedHours: null,
      actualHours: 0,
      assignedTo: null,
      dependencies: [],
      subtasks: []
    },
    {
      id: '3',
      title: 'Task C',
      description: 'Third',
      status: TaskStatus.Todo,
      priority: TaskPriority.High,
      category: TaskCategory.Testing,
      tags: ['backend'],
      createdAt: new Date('2025-03-01'),
      updatedAt: new Date('2025-03-01'),
      dueDate: null,
      estimatedHours: null,
      actualHours: 0,
      assignedTo: null,
      dependencies: [],
      subtasks: []
    }
  ]

  test('no tag filter returns all tasks', () => {
    const result = filterTasks(tasks as any, { status: null, priority: null, category: null, tags: [], searchQuery: '', dateRange: { start: null, end: null } })
    expect(result).toHaveLength(3)
  })

  test('single tag filter returns matching tasks', () => {
    const result = filterTasks(tasks as any, { status: null, priority: null, category: null, tags: ['ui'], searchQuery: '', dateRange: { start: null, end: null } })
    expect(result.map(t => t.id).sort()).toEqual(['1', '2'])
  })

  test('multiple tags filter returns tasks that match any tag', () => {
    const result = filterTasks(tasks as any, { status: null, priority: null, category: null, tags: ['backend', 'frontend'], searchQuery: '', dateRange: { start: null, end: null } })
    expect(result.map(t => t.id).sort()).toEqual(['1', '3'])
  })
})
