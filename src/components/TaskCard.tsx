import React from 'react'
import { useDrag } from 'react-dnd'
import { Task, TaskPriority, TaskStatus } from '@/types'
import { formatDateShort, isOverdue, isDueSoon } from '@/utils/dateUtils'
import { getTaskProgress } from '@/utils/taskUtils'
import './TaskCard.css'

interface TaskCardProps {
  task: Task
  allTasks: Task[]
  onClick: () => void
}

const priorityColors = {
  [TaskPriority.Low]: '#4CAF50',
  [TaskPriority.Medium]: '#FF9800',
  [TaskPriority.High]: '#F44336',
  [TaskPriority.Critical]: '#9C27B0'
}

const statusLabels = {
  [TaskStatus.Todo]: 'Todo',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Review]: 'Review',
  [TaskStatus.Done]: 'Done'
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, allTasks, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  const progress = getTaskProgress(task, allTasks)
  const overdue = isOverdue(task.dueDate)
  const dueSoon = isDueSoon(task.dueDate)

  return (
    <div
      ref={drag}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
      style={{ borderLeftColor: priorityColors[task.priority] }}
    >
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className="task-status">{statusLabels[task.status]}</span>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-meta">
        <span className="task-category">{task.category}</span>
        {task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map(tag => (
              <span key={tag} className="task-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
      {task.subtasks.length > 0 && (
        <div className="task-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="task-footer">
        {task.dueDate && (
          <span className={`task-due-date ${overdue ? 'overdue' : dueSoon ? 'due-soon' : ''}`}>
            {formatDateShort(task.dueDate)}
          </span>
        )}
        {task.status === TaskStatus.Done && task.completedAt && (
          <span className="task-completed">Completed: {formatDateShort(task.completedAt)}</span>
        )}
        <div className="task-hours">
          {task.actualHours > 0 && <span>{task.actualHours.toFixed(1)}h</span>}
          {task.estimatedHours && <span>/{task.estimatedHours}h</span>}
        </div>
      </div>
    </div>
  )
}
