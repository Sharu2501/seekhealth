export class JournalDataService {
  
  static userEmailOrGuest() {
    const user = JSON.parse(localStorage.getItem('user')) || null
    return user?.email || 'guest'
  }

  static getJournalDataForPeriod(startDate, endDate) {
    const userKey = this.userEmailOrGuest()
    const data = []
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const key = `journal-${userKey}-${dateStr}`
      const savedData = localStorage.getItem(key)
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          data.push({
            date: dateStr,
            ...parsed
          })
        } catch (error) {
          console.error(`Erreur lors du parsing des données pour ${dateStr}:`, error)
        }
      }
    }
    
    return data
  }

  static getSleepDataForPeriod(startDate, endDate) {
    const journalData = this.getJournalDataForPeriod(startDate, endDate)
    
    return journalData
      .filter(entry => entry.sommeil && entry.sommeil.sleepMinutesTotal)
      .map(entry => ({
        date: entry.date,
        sleepHours: entry.sommeil.sleepHours || Math.floor(entry.sommeil.sleepMinutesTotal / 60),
        sleepMinutes: entry.sommeil.sleepMinutes || (entry.sommeil.sleepMinutesTotal % 60),
        sleepMinutesTotal: entry.sommeil.sleepMinutesTotal,
        wakeFeeling: entry.sommeil.wakeFeeling
      }))
  }

  static getMoodDataForPeriod(startDate, endDate) {
    const journalData = this.getJournalDataForPeriod(startDate, endDate)
    
    return journalData
      .filter(entry => entry.humeur && entry.humeur.mainMood)
      .map(entry => ({
        date: entry.date,
        mainMood: entry.humeur.mainMood,
        intensity: entry.humeur.intensity,
        secondaryEmotions: entry.humeur.secondaryEmotions || [],
        factors: entry.humeur.factors || [],
        notes: entry.humeur.notes || ''
      }))
  }

  static getActivityDataForPeriod(startDate, endDate) {
    const journalData = this.getJournalDataForPeriod(startDate, endDate)
    
    return journalData
      .filter(entry => entry.completions && entry.completions.activite)
      .map(entry => {
        const activityData = entry.completions.activite[entry.date]
        return {
          date: entry.date,
          activities: activityData?.activite || [],
          noActivity: activityData?.noActivity || false,
          totalDuration: this.calculateTotalActivityDuration(activityData?.activite || [])
        }
      })
  }

  static calculateTotalActivityDuration(activities) {
    return activities.reduce((total, activity) => total + (activity.duration || 0), 0)
  }

  static moodToNumericValue(mood) {
    const moodValues = {
      'terrible': 2,
      'mauvais': 4,
      'moyen': 6,
      'bon': 8,
      'excellent': 10
    }
    return moodValues[mood] || 5
  }

  static calculateSleepStats(sleepData) {
    if (sleepData.length === 0) {
      return {
        moyenne: '--',
        meilleurJour: '--',
        pireJour: '--',
        joursSuivis: '0/7'
      }
    }

    const totalMinutes = sleepData.reduce((sum, entry) => sum + entry.sleepMinutesTotal, 0)
    const averageMinutes = totalMinutes / sleepData.length
    const averageHours = Math.floor(averageMinutes / 60)
    const averageRemainingMinutes = Math.round(averageMinutes % 60)

    const bestDay = sleepData.reduce((best, current) => 
      current.sleepMinutesTotal > best.sleepMinutesTotal ? current : best
    )
    const worstDay = sleepData.reduce((worst, current) => 
      current.sleepMinutesTotal < worst.sleepMinutesTotal ? current : worst
    )

    return {
      moyenne: `${averageHours}h${averageRemainingMinutes.toString().padStart(2, '0')}`,
      meilleurJour: this.formatDayName(bestDay.date),
      pireJour: this.formatDayName(worstDay.date),
      joursSuivis: `${sleepData.length}/7`
    }
  }

  static calculateMoodStats(moodData) {
    if (moodData.length === 0) {
      return {
        moyenne: '--',
        positif: '--',
        bas: '--',
        joursSuivis: '0/7'
      }
    }

    const numericValues = moodData.map(entry => ({
      ...entry,
      numericValue: this.moodToNumericValue(entry.mainMood)
    }))

    const totalValue = numericValues.reduce((sum, entry) => sum + entry.numericValue, 0)
    const average = totalValue / numericValues.length

    const bestDay = numericValues.reduce((best, current) => 
      current.numericValue > best.numericValue ? current : best
    )
    const worstDay = numericValues.reduce((worst, current) => 
      current.numericValue < worst.numericValue ? current : worst
    )

    return {
      moyenne: `${average.toFixed(1)}/10`,
      positif: this.formatDayName(bestDay.date),
      bas: this.formatDayName(worstDay.date),
      joursSuivis: `${moodData.length}/7`
    }
  }

  static calculateCorrelationStats(activityData, moodData) {
    if (activityData.length === 0 || moodData.length === 0) {
      return {
        correlation: '--',
        actif: '--',
        humeur: '--'
      }
    }

    const commonDates = activityData
      .filter(activity => moodData.some(mood => mood.date === activity.date))
      .map(activity => {
        const mood = moodData.find(m => m.date === activity.date)
        return {
          date: activity.date,
          activityDuration: activity.totalDuration,
          moodValue: this.moodToNumericValue(mood.mainMood)
        }
      })

    if (commonDates.length < 2) {
      return {
        correlation: '--',
        actif: '--',
        humeur: '--'
      }
    }

    const correlation = this.calculatePearsonCorrelation(
      commonDates.map(d => d.activityDuration),
      commonDates.map(d => d.moodValue)
    )

    const mostActiveDay = activityData.reduce((best, current) => 
      current.totalDuration > best.totalDuration ? current : best
    )

    const bestMoodDay = moodData.reduce((best, current) => 
      this.moodToNumericValue(current.mainMood) > this.moodToNumericValue(best.mainMood) ? current : best
    )

    return {
      correlation: correlation.toFixed(2),
      actif: this.formatDayName(mostActiveDay.date),
      humeur: this.formatDayName(bestMoodDay.date)
    }
  }

  static calculatePearsonCorrelation(x, y) {
    const n = x.length
    if (n === 0) return 0

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  static formatDayName(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { weekday: 'long' })
  }

  static formatShortDayName(dateStr) {
    const date = new Date(dateStr)
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    return dayNames[date.getDay()]
  }

  static getSleepChartData(startDate, endDate) {
    const sleepData = this.getSleepDataForPeriod(startDate, endDate)
    
    const weekData = this.createWeeklyDataArray(startDate, endDate)
    
    sleepData.forEach(entry => {
      const dayIndex = weekData.findIndex(day => day.date === entry.date)
      if (dayIndex !== -1) {
        weekData[dayIndex].value = entry.sleepHours + (entry.sleepMinutes / 60)
      }
    })

    return {
      labels: weekData.map(day => this.formatShortDayName(day.date)),
      values: weekData.map(day => day.value || 0)
    }
  }

  static getMoodChartData(startDate, endDate) {
    const moodData = this.getMoodDataForPeriod(startDate, endDate)
    
    const weekData = this.createWeeklyDataArray(startDate, endDate)
    
    moodData.forEach(entry => {
      const dayIndex = weekData.findIndex(day => day.date === entry.date)
      if (dayIndex !== -1) {
        weekData[dayIndex].value = this.moodToNumericValue(entry.mainMood)
      }
    })

    return {
      labels: weekData.map(day => this.formatShortDayName(day.date)),
      values: weekData.map(day => day.value || 0)
    }
  }

  static getCorrelationChartData(startDate, endDate) {
    const activityData = this.getActivityDataForPeriod(startDate, endDate)
    const moodData = this.getMoodDataForPeriod(startDate, endDate)
    
    const correlationData = activityData
      .map(activity => {
        const mood = moodData.find(m => m.date === activity.date)
        if (mood) {
          return {
            x: activity.totalDuration,
            y: this.moodToNumericValue(mood.mainMood)
          }
        }
        return null
      })
      .filter(Boolean)

    return correlationData
  }

  static createWeeklyDataArray(startDate, endDate) {
    const data = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      data.push({
        date: date.toISOString().split('T')[0],
        value: null
      })
    }
    
    return data
  }

  static getCurrentWeekPeriod() {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = dimanche, 1 = lundi, etc.
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1) // Lundi
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Dimanche
    
    return {
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: endOfWeek.toISOString().split('T')[0]
    }
  }
}