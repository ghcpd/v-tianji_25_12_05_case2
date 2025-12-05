import { describe, it, expect } from 'vitest'
import { taskReducer } from '../TaskContext'
import { TaskStatus } from '../../types'

const baseTaskPayload = {
  title: 'Test task',
  description: 'desc',
  status: TaskStatus.Todo,
  priority: 'low',
  category: 'development',
  tags: [],
  dueDate: null,
  estimatedHours: null,
  assignedTo: null,
  dependencies: [],
  subtasks: []
}

describe('taskReducer completedAt behavior', () => {
  it('ADD_TASK should set completedAt to null', () => {
    const initialState = { tasks: [], filter: {} }
    const action = { type: 'ADD_TASK', payload: baseTaskPayload }
    const newState = taskReducer(initialState as any, action as any)
    expect(newState.tasks[0].completedAt).toBeNull()
  })

  it('UPDATE_TASK to Done sets completedAt', () => {
    const task = { id: '1', ...baseTaskPayload, createdAt: new Date(), updatedAt: new Date(), actualHours: 0, completedAt: null }
    const initialState = { tasks: [task], filter: {} }
    const action = { type: 'UPDATE_TASK', payload: { id: '1', updates: { status: TaskStatus.Done } } }
    const newState = taskReducer(initialState as any, action as any)
    expect(newState.tasks[0].status).toBe(TaskStatus.Done)
    expect(newState.tasks[0].completedAt).toBeInstanceOf(Date)
  })

  it('UPDATE_TASK from Done clears completedAt when status changes away from Done', () => {
    const task = { id: '1', ...baseTaskPayload, status: TaskStatus.Done, createdAt: new Date(), updatedAt: new Date(), actualHours: 0, completedAt: new Date() }
    const initialState = { tasks: [task], filter: {} }
    const action = { type: 'UPDATE_TASK', payload: { id: '1', updates: { status: TaskStatus.InProgress } } }
    const newState = taskReducer(initialState as any, action as any)
    expect(newState.tasks[0].status).toBe(TaskStatus.InProgress)
    expect(newState.tasks[0].completedAt).toBeNull()
  })
})
