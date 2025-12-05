import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { TaskCard } from '../TaskCard'
import { Task } from '../../types'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const mockTask: Task = {
  id: '1',
  title: 'Task 1',
  description: 'desc',
  status: 'todo',
  priority: 'medium',
  category: 'development',
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  dueDate: null,
  estimatedHours: null,
  actualHours: 0,
  assignedTo: null,
  dependencies: [],
  subtasks: [],
  starred: false
}

describe('TaskCard star button', () => {
  it('dispatches toggle event when star clicked', () => {
    const { getByRole } = render(
      <DndProvider backend={HTML5Backend}>
        <TaskCard task={mockTask} allTasks={[mockTask]} onClick={() => {}} />
      </DndProvider>
    )
    const button = getByRole('button', { name: /star task/i })
    const handler = vi.fn()
    window.addEventListener('toggle-star', handler)
    fireEvent.click(button)
    expect(handler).toHaveBeenCalled()
    window.removeEventListener('toggle-star', handler)
  })
})
