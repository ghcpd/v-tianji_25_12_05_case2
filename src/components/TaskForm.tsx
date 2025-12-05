import React, { useState, useEffect } from 'react'
import { Task, TaskPriority, TaskStatus, TaskCategory } from '@/types'
import { useTaskContext } from '@/context/TaskContext'
import './TaskForm.css'

interface TaskFormProps {
  task?: Task
  onClose: () => void
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { addTask, updateTask } = useTaskContext()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.Todo,
    priority: TaskPriority.Medium,
    category: TaskCategory.Development,
    tags: [] as string[],
    dueDate: '',
    estimatedHours: '',
    assignedTo: '',
    dependencies: [] as string[]
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        category: task.category,
        tags: task.tags,
        dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
        estimatedHours: task.estimatedHours?.toString() || '',
        assignedTo: task.assignedTo || '',
        dependencies: task.dependencies
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const taskData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      assignedTo: formData.assignedTo || null,
      subtasks: task?.subtasks || []
    }

    if (task) {
      updateTask(task.id, taskData)
    } else {
      addTask(taskData)
    }
    onClose()
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  return (
    <div className="task-form-overlay" onClick={onClose}>
      <div className="task-form" onClick={e => e.stopPropagation()}>
        <div className="form-header">
          <h2>{task ? 'Edit Task' : 'Create Task'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
              >
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              >
                {Object.values(TaskPriority).map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as TaskCategory })}
              >
                {Object.values(TaskCategory).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Estimated Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimatedHours}
                onChange={e => setFormData({ ...formData, estimatedHours: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Assigned To</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Tags</label>
            <div className="tag-input-group">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag"
              />
              <button type="button" onClick={handleAddTag}>Add</button>
            </div>
            <div className="tags-list">
              {formData.tags.map(tag => (
                <span key={tag} className="tag-item">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                </span>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">{task ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
