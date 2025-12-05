import { describe, it, expect } from 'vitest'
import React, { act } from 'react'
import { render } from '@testing-library/react'
import { TaskProvider, useTaskContext } from '../../context/TaskContext'
import { TaskPriority, TaskStatus, TaskCategory } from '../../types'

const TestApp: React.FC = () => {
  const ctx = useTaskContext()
  // expose helpers for test via window
  // @ts-ignore
  window.testApi = {
    addTask: ctx.addTask,
    toggleStar: ctx.toggleStar,
    getState: () => ctx.state
  }
  return null
}

describe('TaskContext toggleStar', () => {
  it('toggles starred on a task', () => {
    render(
      <TaskProvider>
        <TestApp />
      </TaskProvider>
    )

    // @ts-ignore
    act(() => {
      // @ts-ignore
      window.testApi.addTask({
      title: 'Test',
      description: 'desc',
      status: TaskStatus.Todo,
      priority: TaskPriority.Medium,
      category: TaskCategory.Development,
      tags: [],
      dueDate: null,
      estimatedHours: null,
      assignedTo: null,
      dependencies: [],
      subtasks: []
      })
    })

    // @ts-ignore
    const task = window.testApi.getState().tasks[0]
    expect(task.starred).toBeFalsy()

    // @ts-ignore
    act(() => {
      // @ts-ignore
      window.testApi.toggleStar(task.id)
    })
    // @ts-ignore
    expect(window.testApi.getState().tasks[0].starred).toBeTruthy()

    // @ts-ignore
    act(() => {
      // @ts-ignore
      window.testApi.toggleStar(task.id)
    })
    // @ts-ignore
    expect(window.testApi.getState().tasks[0].starred).toBeFalsy()
  })
})
