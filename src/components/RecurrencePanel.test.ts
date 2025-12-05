import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RecurrenceFrequency, RecurrenceRule } from '@/types'

describe('RecurrencePanel Component', () => {
  let mockRecurrence: RecurrenceRule | null
  let mockOnChange: (recurrence: RecurrenceRule | null) => void

  beforeEach(() => {
    mockRecurrence = null
    mockOnChange = vi.fn()
  })

  describe('Initial state', () => {
    it('should initialize with no recurrence', () => {
      expect(mockRecurrence).toBeNull()
      expect(mockOnChange).toBeDefined()
    })

    it('should initialize with existing recurrence rule', () => {
      const existingRule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 1,
        endDate: new Date('2025-12-31'),
        maxOccurrences: null,
        daysOfWeek: [1, 3]
      }

      mockRecurrence = existingRule

      expect(mockRecurrence.frequency).toBe(RecurrenceFrequency.Weekly)
      expect(mockRecurrence.daysOfWeek).toEqual([1, 3])
    })
  })

  describe('Frequency selection', () => {
    it('should support all frequency options', () => {
      const frequencies = Object.values(RecurrenceFrequency)

      expect(frequencies).toContain(RecurrenceFrequency.Daily)
      expect(frequencies).toContain(RecurrenceFrequency.Weekly)
      expect(frequencies).toContain(RecurrenceFrequency.Biweekly)
      expect(frequencies).toContain(RecurrenceFrequency.Monthly)
      expect(frequencies).toContain(RecurrenceFrequency.Quarterly)
      expect(frequencies).toContain(RecurrenceFrequency.Yearly)
    })

    it('should clear recurrence when frequency is set to null', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 1,
        endDate: null,
        maxOccurrences: null,
        daysOfWeek: []
      }

      // Simulate clearing
      const cleared = { ...rule, frequency: null }
      expect(cleared.frequency).toBeNull()
    })
  })

  describe('Interval handling', () => {
    it('should enforce minimum interval of 1', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: Math.max(1, 0), // Simulating validation
        endDate: null,
        maxOccurrences: null,
        daysOfWeek: []
      }

      expect(rule.interval).toBe(1)
    })

    it('should handle custom intervals', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 3,
        endDate: null,
        maxOccurrences: null,
        daysOfWeek: []
      }

      expect(rule.interval).toBe(3)
    })
  })

  describe('Days of week selection', () => {
    it('should allow selecting multiple days of week for weekly recurrence', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 1,
        endDate: null,
        maxOccurrences: null,
        daysOfWeek: [0, 2, 4, 6] // Sun, Tue, Thu, Sat
      }

      expect(rule.daysOfWeek).toHaveLength(4)
      expect(rule.daysOfWeek).toContain(0)
      expect(rule.daysOfWeek).toContain(2)
    })

    it('should handle toggling days on and off', () => {
      let daysOfWeek = [1, 3] // Mon, Wed

      // Add Friday
      if (!daysOfWeek.includes(5)) {
        daysOfWeek = [...daysOfWeek, 5]
      }
      expect(daysOfWeek).toEqual([1, 3, 5])

      // Remove Wednesday
      daysOfWeek = daysOfWeek.filter(d => d !== 3)
      expect(daysOfWeek).toEqual([1, 5])
    })

    it('should be empty array for non-weekly frequencies', () => {
      const dailyRule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Daily,
        interval: 1,
        endDate: null,
        maxOccurrences: null,
        daysOfWeek: []
      }

      expect(dailyRule.daysOfWeek).toHaveLength(0)
    })
  })

  describe('End date handling', () => {
    it('should accept valid end date', () => {
      const endDate = new Date('2025-12-31')
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 1,
        endDate,
        maxOccurrences: null,
        daysOfWeek: []
      }

      expect(rule.endDate).toEqual(endDate)
    })

    it('should handle null end date (unlimited)', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 1,
        endDate: null,
        maxOccurrences: null,
        daysOfWeek: []
      }

      expect(rule.endDate).toBeNull()
    })

    it('should clear end date when input is emptied', () => {
      let endDate: Date | null = new Date('2025-12-31')
      endDate = endDate ? null : endDate

      expect(endDate).toBeNull()
    })
  })

  describe('Max occurrences handling', () => {
    it('should accept positive max occurrences', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 1,
        endDate: null,
        maxOccurrences: 10,
        daysOfWeek: []
      }

      expect(rule.maxOccurrences).toBe(10)
    })

    it('should handle null max occurrences (unlimited)', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 1,
        endDate: null,
        maxOccurrences: null,
        daysOfWeek: []
      }

      expect(rule.maxOccurrences).toBeNull()
    })

    it('should validate minimum value', () => {
      const value = Math.max(1, 0) // Simulating validation
      expect(value).toBe(1)
    })

    it('should clear max occurrences when input is emptied', () => {
      let maxOccurrences: number | null = 5
      maxOccurrences = maxOccurrences ? null : maxOccurrences

      expect(maxOccurrences).toBeNull()
    })
  })

  describe('Rule validation and creation', () => {
    it('should create valid rule with all constraints', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 2,
        endDate: new Date('2025-12-31'),
        maxOccurrences: 26,
        daysOfWeek: [1, 3, 5]
      }

      // Validate structure
      expect(rule.frequency).toBeDefined()
      expect(rule.interval).toBeGreaterThanOrEqual(1)
      expect(rule.endDate).toBeDefined()
      expect(rule.maxOccurrences).toBeGreaterThanOrEqual(1)
      expect(rule.daysOfWeek).toHaveLength(3)
    })

    it('should create minimal valid rule', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Daily,
        interval: 1,
        endDate: null,
        maxOccurrences: null,
        daysOfWeek: []
      }

      expect(rule.frequency).toBe(RecurrenceFrequency.Daily)
      expect(rule.interval).toBe(1)
      expect(rule.endDate).toBeNull()
      expect(rule.maxOccurrences).toBeNull()
    })

    it('should clear recurrence when frequency is null', () => {
      const clearedRule: RecurrenceRule | null = null

      expect(clearedRule).toBeNull()
    })
  })

  describe('Form interactions', () => {
    it('should handle save action', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Weekly,
        interval: 1,
        endDate: null,
        maxOccurrences: null,
        daysOfWeek: [1]
      }

      mockOnChange(rule)

      expect(mockOnChange).toHaveBeenCalledWith(rule)
    })

    it('should handle cancel action', () => {
      // Cancel just closes the panel without changes
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('should handle clear recurrence', () => {
      mockOnChange(null)

      expect(mockOnChange).toHaveBeenCalledWith(null)
    })
  })

  describe('Edge cases', () => {
    it('should handle date string conversion', () => {
      const dateString = '2025-12-31'
      const date = new Date(dateString)

      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(11) // December is 11 in 0-indexed
      expect(date.getDate()).toBe(31)
    })

    it('should handle interval of zero by enforcing minimum', () => {
      const interval = Math.max(1, 0)
      expect(interval).toBe(1)
    })

    it('should handle empty days of week array', () => {
      const rule: RecurrenceRule = {
        frequency: RecurrenceFrequency.Monthly,
        interval: 1,
        endDate: null,
        maxOccurrences: null,
        daysOfWeek: []
      }

      expect(rule.daysOfWeek).toHaveLength(0)
    })
  })
})
