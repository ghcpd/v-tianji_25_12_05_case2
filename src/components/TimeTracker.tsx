import React, { useState, useEffect } from 'react'
import { useTaskContext } from '@/context/TaskContext'
import { format } from 'date-fns'
import './TimeTracker.css'

export const TimeTracker: React.FC = () => {
  const { state, startTimer, stopTimer } = useTaskContext()
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!state.activeTimer) {
      setElapsedTime(0)
      return
    }

    const interval = setInterval(() => {
      const now = new Date()
      const start = state.activeTimer!.startTime
      const elapsed = (now.getTime() - start.getTime()) / 1000
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [state.activeTimer])

  const activeTask = state.activeTimer
    ? state.tasks.find(t => t.id === state.activeTimer.taskId)
    : null

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = (taskId: string) => {
    startTimer(taskId)
  }

  const handleStop = () => {
    if (state.activeTimer) {
      stopTimer(state.activeTimer.taskId)
    }
  }

  return (
    <div className="time-tracker">
      <h3>Time Tracker</h3>
      {activeTask ? (
        <div className="active-timer">
          <div className="timer-info">
            <p className="timer-task">{activeTask.title}</p>
            <p className="timer-time">{formatTime(elapsedTime)}</p>
          </div>
          <button onClick={handleStop} className="stop-button">Stop</button>
        </div>
      ) : (
        <div className="timer-list">
          {state.tasks
            .filter(task => task.status !== 'done')
            .slice(0, 5)
            .map(task => (
              <div key={task.id} className="timer-item">
                <span className="timer-item-title">{task.title}</span>
                <button onClick={() => handleStart(task.id)} className="start-button">Start</button>
              </div>
            ))}
        </div>
      )}
      <div className="recent-entries">
        <h4>Recent Entries</h4>
        {state.timeEntries
          .filter(entry => entry.endTime)
          .slice(-5)
          .reverse()
          .map(entry => {
            const task = state.tasks.find(t => t.id === entry.taskId)
            return (
              <div key={entry.id} className="entry-item">
                <span>{task?.title || 'Unknown'}</span>
                <span>{entry.duration.toFixed(2)}h</span>
              </div>
            )
          })}
      </div>
    </div>
  )
}
