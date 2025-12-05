import React from 'react'
import { useTaskContext } from '../context/TaskContext'
import { TaskStatus, TaskPriority, TaskCategory } from '../types'
import './FilterPanel.css'

export const FilterPanel: React.FC = () => {
  const { state, setFilter, resetFilter } = useTaskContext()

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button onClick={resetFilter} className="reset-button">Reset</button>
      </div>
      <div className="filter-group">
        <label>Search</label>
        <input
          type="text"
          placeholder="Search tasks..."
          value={state.filter.searchQuery}
          onChange={e => setFilter({ searchQuery: e.target.value })}
        />
      </div>
      <div className="filter-group">
        <label>Status</label>
        <select
          value={state.filter.status || ''}
          onChange={e => setFilter({ status: e.target.value ? e.target.value as TaskStatus : null })}
        >
          <option value="">All</option>
          {Object.values(TaskStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Priority</label>
        <select
          value={state.filter.priority || ''}
          onChange={e => setFilter({ priority: e.target.value ? e.target.value as TaskPriority : null })}
        >
          <option value="">All</option>
          {Object.values(TaskPriority).map(priority => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Category</label>
        <select
          value={state.filter.category || ''}
          onChange={e => setFilter({ category: e.target.value ? e.target.value as TaskCategory : null })}
        >
          <option value="">All</option>
          {Object.values(TaskCategory).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Date Range</label>
        <div className="date-inputs">
          <input
            type="date"
            value={state.filter.dateRange.start ? state.filter.dateRange.start.toISOString().split('T')[0] : ''}
            onChange={e => setFilter({
              dateRange: {
                ...state.filter.dateRange,
                start: e.target.value ? new Date(e.target.value) : null
              }
            })}
          />
          <span>to</span>
          <input
            type="date"
            value={state.filter.dateRange.end ? state.filter.dateRange.end.toISOString().split('T')[0] : ''}
            onChange={e => setFilter({
              dateRange: {
                ...state.filter.dateRange,
                end: e.target.value ? new Date(e.target.value) : null
              }
            })}
          />
        </div>
      </div>
    </div>
  )
}
