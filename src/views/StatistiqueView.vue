<template>
  <div class="statistique-view">
    <div class="export-header">
      <div class="period-selector">
        <label>Période d'analyse:</label>
        <select v-model="selectedPeriod" @change="onPeriodChange">
          <option value="week">Cette semaine</option>
          <option value="lastWeek">Semaine dernière</option>
          <option value="custom">Période personnalisée</option>
        </select>
        
        <div v-if="selectedPeriod === 'custom'" class="custom-period">
          <input 
            type="date" 
            v-model="customStartDate" 
            @change="onPeriodChange"
            max="today"
          />
          <span>à</span>
          <input 
            type="date" 
            v-model="customEndDate" 
            @change="onPeriodChange"
            :min="customStartDate"
            max="today"
          />
        </div>
      </div>
      
      <button class="export-button" @click="exporterPDF">📄 Export PDF</button>
    </div>

    <div class="period-info">
      <h3>📅 Analyse du {{ formatPeriod() }}</h3>
      <div class="data-summary">
        <span class="summary-item">
          <strong>{{ totalDaysWithData }}</strong> jour(s) avec données
        </span>
        <span class="summary-item">
          <strong>{{ completionRate }}%</strong> de complétion moyenne
        </span>
      </div>
    </div>

    <div class="top-graphs">
      <div class="graph-column">
        <SleepSection ref="sleep" :key="periodKey" />
      </div>
      <div class="graph-column">
        <MoodSection ref="mood" :key="periodKey" />
      </div>
    </div>

    <div class="bottom-graph">
      <CorrelationSection ref="correlation" :key="periodKey" />
    </div>

    <div class="insights-section" v-if="insights.length > 0">
      <h3>💡 Insights automatiques</h3>
      <div class="insights-grid">
        <div 
          v-for="insight in insights" 
          :key="insight.id"
          class="insight-card"
          :class="insight.type"
        >
          <div class="insight-icon">{{ insight.icon }}</div>
          <div class="insight-content">
            <h4>{{ insight.title }}</h4>
            <p>{{ insight.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SleepSection from '@/components/statistique/SleepSection.vue'
import MoodSection from '@/components/statistique/MoodSection.vue'
import CorrelationSection from '@/components/statistique/CorrelationSection.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { JournalDataService } from '@/services/journalDataService.js'
import jsPDF from 'jspdf'

const sleep = ref(null)
const mood = ref(null)
const correlation = ref(null)

const selectedPeriod = ref('week')
const customStartDate = ref('')
const customEndDate = ref('')
const periodKey = ref(0) // Pour forcer le rechargement des composants
const insights = ref([])
const totalDaysWithData = ref(0)
const completionRate = ref(0)

const currentPeriod = computed(() => {
  if (selectedPeriod.value === 'custom' && customStartDate.value && customEndDate.value) {
    return {
      startDate: customStartDate.value,
      endDate: customEndDate.value
    }
  } else if (selectedPeriod.value === 'lastWeek') {
    const { startDate, endDate } = JournalDataService.getCurrentWeekPeriod()
    const lastWeekStart = new Date(startDate)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(endDate)
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7)
    
    return {
      startDate: lastWeekStart.toISOString().split('T')[0],
      endDate: lastWeekEnd.toISOString().split('T')[0]
    }
  } else {
    return JournalDataService.getCurrentWeekPeriod()
  }
})

const formatPeriod = () => {
  const start = new Date(currentPeriod.value.startDate)
  const end = new Date(currentPeriod.value.endDate)
  
  const formatDate = (date) => date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
  
  if (selectedPeriod.value === 'week') {
    return 'cette semaine'
  } else if (selectedPeriod.value === 'lastWeek') {
    return 'la semaine dernière'
  } else {
    return `${formatDate(start)} au ${formatDate(end)}`
  }
}

const onPeriodChange = () => {
  // Force le rechargement des composants
  periodKey.value++
  calculateInsights()
  calculateDataSummary()
}

const calculateDataSummary = () => {
  try {
    const { startDate, endDate } = currentPeriod.value
    const journalData = JournalDataService.getJournalDataForPeriod(startDate, endDate)
    
    totalDaysWithData.value = journalData.length
    
    if (journalData.length > 0) {
      const totalSections = journalData.length * 4 // 4 sections par jour
      const completedSections = journalData.reduce((sum, day) => {
        const completions = day.completions || {}
        return sum + Object.values(completions).filter(section => 
          section === true || (typeof section === 'object' && section.isComplete)
        ).length
      }, 0)
      
      completionRate.value = Math.round((completedSections / totalSections) * 100)
    } else {
      completionRate.value = 0
    }
  } catch (error) {
    console.error('Erreur lors du calcul du résumé des données:', error)
    totalDaysWithData.value = 0
    completionRate.value = 0
  }
}

const calculateInsights = () => {
  try {
    const { startDate, endDate } = currentPeriod.value
    const sleepData = JournalDataService.getSleepDataForPeriod(startDate, endDate)
    const moodData = JournalDataService.getMoodDataForPeriod(startDate, endDate)
    const activityData = JournalDataService.getActivityDataForPeriod(startDate, endDate)
    
    const newInsights = []
    
    // Insight sur le sommeil
    if (sleepData.length > 0) {
      const avgSleep = sleepData.reduce((sum, day) => sum + day.sleepMinutesTotal, 0) / sleepData.length
      const avgHours = avgSleep / 60
      
      if (avgHours < 7) {
        newInsights.push({
          id: 'sleep-low',
          type: 'warning',
          icon: '😴',
          title: 'Sommeil insuffisant',
          message: `Votre moyenne de ${(avgHours).toFixed(1)}h est en dessous des 7-9h recommandées.`
        })
      } else if (avgHours >= 7 && avgHours <= 9) {
        newInsights.push({
          id: 'sleep-good',
          type: 'positive',
          icon: '✅',
          title: 'Excellent sommeil',
          message: `Votre moyenne de ${(avgHours).toFixed(1)}h est dans la plage recommandée !`
        })
      }
    }
    
    // Insight sur l'humeur
    if (moodData.length > 0) {
      const avgMood = moodData.reduce((sum, day) => 
        sum + JournalDataService.moodToNumericValue(day.mainMood), 0) / moodData.length
      
      if (avgMood >= 8) {
        newInsights.push({
          id: 'mood-excellent',
          type: 'positive',
          icon: '🌟',
          title: 'Humeur excellente',
          message: `Votre humeur moyenne de ${avgMood.toFixed(1)}/10 indique une très bonne période !`
        })
      } else if (avgMood < 5) {
        newInsights.push({
          id: 'mood-low',
          type: 'info',
          icon: '💙',
          title: 'Période difficile',
          message: `Votre humeur moyenne est de ${avgMood.toFixed(1)}/10. Prenez soin de vous.`
        })
      }
    }
    
    // Insight sur l'activité
    if (activityData.length > 0) {
      const activeDays = activityData.filter(day => day.totalDuration > 0).length
      const activeRatio = activeDays / activityData.length
      
      if (activeRatio >= 0.8) {
        newInsights.push({
          id: 'activity-high',
          type: 'positive',
          icon: '💪',
          title: 'Très actif',
          message: `Bravo ! Vous avez été actif ${activeDays} jour(s) sur ${activityData.length}.`
        })
      } else if (activeRatio < 0.3) {
        newInsights.push({
          id: 'activity-low',
          type: 'info',
          icon: '🏃‍♂️',
          title: 'Plus d\'activité',
          message: `Essayez d'augmenter votre activité physique. Seulement ${activeDays} jour(s) actif(s).`
        })
      }
    }
    
    // Insight sur la corrélation
    if (activityData.length > 2 && moodData.length > 2) {
      const correlationStats = JournalDataService.calculateCorrelationStats(activityData, moodData)
      const correlation = parseFloat(correlationStats.correlation)
      
      if (correlation > 0.5) {
        newInsights.push({
          id: 'correlation-positive',
          type: 'positive',
          icon: '📈',
          title: 'Activité booste l\'humeur',
          message: `Forte corrélation positive (${correlationStats.correlation}) entre activité et humeur !`
        })
      }
    }
    
    insights.value = newInsights
  } catch (error) {
    console.error('Erreur lors du calcul des insights:', error)
    insights.value = []
  }
}

const exporterPDF = () => {
  const doc = new jsPDF()
  
  // Récupère les statistiques des composants
  const sleepStats = sleep.value?.getStats() || {}
  const moodStats = mood.value?.getStats() || {}
  const correlationStats = correlation.value?.getStats() || {}

  let y = 20
  
  // Titre
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('RAPPORT SEEKHEALTH', 20, y)
  
  y += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Période: ${formatPeriod()}`, 20, y)
  
  y += 10
  doc.text(`${totalDaysWithData.value} jour(s) avec données - ${completionRate.value}% de complétion`, 20, y)
  
  y += 20
  
  // Section Sommeil
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('🛌 SOMMEIL', 20, y)
  y += 10
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`• Durée moyenne : ${sleepStats.moyenne || '--'}`, 25, y)
  y += 7
  doc.text(`• Meilleur jour : ${sleepStats.meilleurJour || '--'}`, 25, y)
  y += 7
  doc.text(`• Pire jour : ${sleepStats.pireJour || '--'}`, 25, y)
  y += 7
  doc.text(`• Jours suivis : ${sleepStats.joursSuivis || '--'}`, 25, y)
  
  y += 15
  
  // Section Humeur
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('😄 HUMEUR', 20, y)
  y += 10
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`• Note moyenne : ${moodStats.moyenne || '--'}`, 25, y)
  y += 7
  doc.text(`• Jour le plus positif : ${moodStats.positif || '--'}`, 25, y)
  y += 7
  doc.text(`• Jour le plus bas : ${moodStats.bas || '--'}`, 25, y)
  y += 7
  doc.text(`• Jours suivis : ${moodStats.joursSuivis || '--'}`, 25, y)
  
  y += 15
  
  // Section Corrélation
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('📊 CORRELATION ACTIVITE / HUMEUR', 20, y)
  y += 10
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`• Corrélation estimée : ${correlationStats.correlation || '--'}`, 25, y)
  y += 7
  doc.text(`• Jours actifs : ${correlationStats.joursActifs || '--'}`, 25, y)
  y += 7
  doc.text(`• Jour le plus actif : ${correlationStats.actif || '--'}`, 25, y)
  y += 7
  doc.text(`• Jour avec meilleure humeur : ${correlationStats.humeur || '--'}`, 25, y)
  
  // Section Insights
  if (insights.value.length > 0) {
    y += 20
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('💡 INSIGHTS', 20, y)
    y += 10
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    
    insights.value.forEach(insight => {
      if (y > 250) { // Nouvelle page si nécessaire
        doc.addPage()
        y = 20
      }
      
      doc.setFont('helvetica', 'bold')
      doc.text(`• ${insight.title}`, 25, y)
      y += 7
      doc.setFont('helvetica', 'normal')
      doc.text(`  ${insight.message}`, 25, y)
      y += 10
    })
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text(`Page ${i}/${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 285)
  }
  
  doc.save(`rapport_seekhealth_${formatPeriod().replace(/\s+/g, '_')}.pdf`)
}

onMounted(() => {
  // Initialise les dates personnalisées
  const { startDate, endDate } = JournalDataService.getCurrentWeekPeriod()
  customStartDate.value = startDate
  customEndDate.value = endDate
  
  calculateInsights()
  calculateDataSummary()
})

watch(currentPeriod, () => {
  calculateInsights()
  calculateDataSummary()
}, { deep: true })
</script>

<style scoped>
.statistique-view {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.export-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.period-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.period-selector label {
  font-weight: 600;
  color: var(--text-primary);
}

.period-selector select {
  padding: 0.5rem;
  border: 1px solid var(--border-medium);
  border-radius: 0.5rem;
  background: var(--background-soft);
  color: var(--text-primary);
}

.custom-period {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.custom-period input {
  padding: 0.5rem;
  border: 1px solid var(--border-medium);
  border-radius: 0.5rem;
  background: var(--background-soft);
  color: var(--text-primary);
}

.export-button {
  background: #9333ea;
  color: white;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.export-button:hover {
  background: #7e22ce;
}

.period-info {
  text-align: center;
  padding: 1.5rem;
  background: var(--background-soft);
  border-radius: 1rem;
  border: 1px solid var(--border-light);
}

.period-info h3 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.data-summary {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.summary-item {
  color: var(--text-secondary);
}

.top-graphs {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.graph-column {
  flex: 1;
  min-width: 400px;
  max-width: 700px;
}

.bottom-graph {
  display: flex;
  justify-content: center;
}

.insights-section {
  margin-top: 2rem;
}

.insights-section h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.insight-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid var(--border-light);
  background: var(--background-soft);
  transition: transform 0.2s;
}

.insight-card:hover {
  transform: translateY(-2px);
}

.insight-card.positive {
  border-left: 4px solid #10b981;
}

.insight-card.warning {
  border-left: 4px solid #f59e0b;
}

.insight-card.info {
  border-left: 4px solid #3b82f6;
}

.insight-icon {
  font-size: 2rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.insight-content h4 {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: var(--text-primary);
}

.insight-content p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .export-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .period-selector {
    justify-content: center;
  }
  
  .top-graphs {
    flex-direction: column;
  }
  
  .graph-column {
    min-width: auto;
    max-width: none;
  }
}
</style>