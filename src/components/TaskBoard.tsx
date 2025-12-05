import React from 'react'
import { useDrop } from 'react-dnd'
import { Task, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'
import { useTaskContext } from '../context/TaskContext'
import { filterTasks, sortTasks } from '../utils/taskUtils'
import './TaskBoard.css'

interface TaskBoardProps {
  onTaskClick: (task: Task) => void
}

const statusColumns: TaskStatus[] = [
  TaskStatus.Todo,
  TaskStatus.InProgress,
  TaskStatus.Review,
  TaskStatus.Done
]

const statusLabels = {
  [TaskStatus.Todo]: 'To Do',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Review]: 'Review',
  [TaskStatus.Done]: 'Done'
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ onTaskClick }) => {
  const { state, updateTask } = useTaskContext()
  const { toggleStar } = useTaskContext()
  const filteredTasks = filterTasks(state.tasks, state.filter)
  const sortedTasks = sortTasks(filteredTasks, 'priority')

  const handleDrop = (status: TaskStatus) => (item: { id: string; status: TaskStatus }) => {
    if (item.status !== status) {
      updateTask(item.id, { status })
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return sortedTasks.filter(task => task.status === status)
  }

  return (
    <div className="task-board">
      {/* listen for star toggle events from TaskCard */}
      <StarListener toggleStar={toggleStar} />
      {statusColumns.map(status => (
        <TaskColumn
          key={status}
          status={status}
          tasks={getTasksByStatus(status)}
          allTasks={state.tasks}
          onDrop={handleDrop(status)}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  )
}

interface TaskColumnProps {
  status: TaskStatus
  tasks: Task[]
  allTasks: Task[]
  onDrop: (item: { id: string; status: TaskStatus }) => void
  onTaskClick: (task: Task) => void
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, allTasks, onDrop, onTaskClick }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  return (
    <div
      ref={drop}
      className={`task-column ${isOver ? 'over' : ''}`}
    >
      <div className="column-header">
        <h2>{statusLabels[status]}</h2>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="column-content">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            allTasks={allTasks}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  )
}

const StarListener: React.FC<{ toggleStar: (id: string) => void }> = ({ toggleStar }) => {
  React.useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.id) {
        toggleStar(e.detail.id)
      }
    }
    window.addEventListener('toggle-star', handler as EventListener)
    return () => window.removeEventListener('toggle-star', handler as EventListener)
  }, [toggleStar])
  return null
}
