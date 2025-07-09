import { describe, it, expect } from 'vitest'
import { sectionCompletions, loadDataForDate } from '@/path/to/your/component'

describe('loadDataForDate', () => {
  it('charge les données de localStorage si existantes', () => {
    const mockDate = '2024-07-09'
    const data = {
      completions: {
        sommeil: true,
        humeur: false,
        activite: true,
        alimentation: false
      }
    }
    localStorage.setItem(`journal-${mockDate}`, JSON.stringify(data))
    loadDataForDate(mockDate)
    expect(sectionCompletions.value).toEqual(data.completions)
  })
})
