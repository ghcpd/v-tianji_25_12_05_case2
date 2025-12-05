import React, { useState } from 'react'
import { RecurrenceRule, RecurrenceFrequency } from '@/types'
import { getRecurrenceDescription } from '@/utils/recurrenceUtils'
import './RecurrencePanel.css'

interface RecurrencePanelProps {
  recurrence: RecurrenceRule | null
  onRecurrenceChange: (recurrence: RecurrenceRule | null) => void
}

export const RecurrencePanel: React.FC<RecurrencePanelProps> = ({ recurrence, onRecurrenceChange }) => {
  const [expanded, setExpanded] = useState(false)
  const [frequency, setFrequency] = useState<RecurrenceFrequency | null>(recurrence?.frequency || null)
  const [interval, setInterval] = useState(recurrence?.interval || 1)
  const [maxOccurrences, setMaxOccurrences] = useState(recurrence?.maxOccurrences || null)
  const [endDate, setEndDate] = useState(recurrence?.endDate?.toISOString().split('T')[0] || '')
  const [daysOfWeek, setDaysOfWeek] = useState(recurrence?.daysOfWeek || [])

  const handleFrequencyChange = (freq: RecurrenceFrequency | null) => {
    setFrequency(freq)
    if (freq === null) {
      onRecurrenceChange(null)
    }
  }

  const handleSave = () => {
    if (frequency === null) {
      onRecurrenceChange(null)
      return
    }

    const rule: RecurrenceRule = {
      frequency,
      interval: Math.max(1, interval),
      endDate: endDate ? new Date(endDate) : null,
      maxOccurrences: maxOccurrences && maxOccurrences > 0 ? maxOccurrences : null,
      daysOfWeek
    }

    onRecurrenceChange(rule)
    setExpanded(false)
  }

  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="recurrence-panel">
      <div className="recurrence-header">
        <button
          className="recurrence-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '▼' : '▶'} Recurrence
        </button>
        {recurrence && frequency && (
          <span className="recurrence-description">{getRecurrenceDescription(recurrence)}</span>
        )}
      </div>

      {expanded && (
        <div className="recurrence-content">
          <div className="form-group">
            <label>Frequency</label>
            <select value={frequency || ''} onChange={(e) => handleFrequencyChange(e.target.value as RecurrenceFrequency || null)}>
              <option value="">No recurrence</option>
              {Object.values(RecurrenceFrequency).map(freq => (
                <option key={freq} value={freq}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {frequency && (
            <>
              <div className="form-group">
                <label>Interval (every N {frequency}s)</label>
                <input
                  type="number"
                  min="1"
                  value={interval}
                  onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              {frequency === RecurrenceFrequency.Weekly && (
                <div className="form-group">
                  <label>Days of week</label>
                  <div className="days-of-week">
                    {dayNames.map((day, index) => (
                      <label key={index} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={daysOfWeek.includes(index)}
                          onChange={() => toggleDayOfWeek(index)}
                        />
                        {day.substring(0, 3)}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Max occurrences (leave empty for unlimited)</label>
                <input
                  type="number"
                  min="1"
                  value={maxOccurrences || ''}
                  onChange={(e) => setMaxOccurrences(e.target.value ? Math.max(1, parseInt(e.target.value)) : null)}
                />
              </div>

              <div className="form-group">
                <label>End date (leave empty for unlimited)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="button-group">
                <button className="save-button" onClick={handleSave}>Save Recurrence</button>
                <button className="cancel-button" onClick={() => setExpanded(false)}>Cancel</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
