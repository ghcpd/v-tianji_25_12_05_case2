import { vi } from 'vitest'
vi.mock('react-dnd', () => ({ useDrag: () => [{ isDragging: false }, () => {}] }))
import React from 'react'
import { render, screen } from '@testing-library/react'
import { TaskCard } from '../TaskCard'
import { TaskStatus } from '../../types'

const sampleTask = {
  id: 't1',
  title: 'Complete UI',
  description: 'desc',
  status: TaskStatus.Done,
  priority: 'low',
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
  completedAt: new Date()
}

test('TaskCard shows completedAt when present', () => {
  render(<TaskCard task={sampleTask as any} allTasks={[]} onClick={() => {}} />)
  expect(screen.getByText(/Completed/i)).toBeInTheDocument()
})
