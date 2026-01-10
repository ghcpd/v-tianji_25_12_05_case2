// @vitest-environment jsdom
import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'

// We'll mock the task context used by FilterPanel so tests focus on the component
const mockSetFilter = vi.fn()
const mockResetFilter = vi.fn()

vi.mock('@/context/TaskContext', () => ({
  useTaskContext: () => ({
    state: {
      tasks: [
        { id: '1', tags: ['alpha', 'beta'] },
        { id: '2', tags: ['beta', 'gamma'] },
        { id: '3', tags: [] }
      ],
      filter: { tags: [], status: null, priority: null, category: null, searchQuery: '', dateRange: { start: null, end: null } }
    },
    setFilter: mockSetFilter,
    resetFilter: mockResetFilter
  })
}))

import { FilterPanel } from '../FilterPanel'

describe('FilterPanel - tag UI', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })
  it('renders unique tags from tasks', () => {
    const { container } = render(<FilterPanel />)
    expect(screen.getByText('alpha')).toBeTruthy()
    expect(screen.getByText('beta')).toBeTruthy()
    expect(screen.getByText('gamma')).toBeTruthy()
    // ensure no duplicate 'beta'
    const matches = container.querySelectorAll('.tag-label')
    const texts = Array.from(matches).map(n => n.textContent)
    const occurrences = texts.filter(t => t === 'beta').length
    expect(occurrences).toBe(1)
  })

  it('clicking a tag toggles it by calling setFilter', () => {
    render(<FilterPanel />)
    const alphaCheckbox = screen.getByRole('checkbox', { name: 'alpha' })
    // fire click to check
    fireEvent.click(alphaCheckbox as HTMLElement)
    expect(mockSetFilter).toHaveBeenCalled()
  })
})
