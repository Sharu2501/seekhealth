<template>
  <div class="chart-container">
    <div class="header">
      <h2>📊 Corrélation activité / humeur</h2>
    </div>

    <div class="chart-wrapper">
      <Scatter :data="chartData" :options="chartOptions" />
      <div class="info-cards">
        <div class="info-card">
          <p class="label">Corrélation estimée</p>
          <p class="value">{{ stats.correlation }}</p>
        </div>
        <div class="info-card">
          <p class="label">Jours actifs</p>
          <p class="value">{{ activeData.joursActifs }}</p>
        </div>
        <div class="info-card">
          <p class="label">Jour avec plus d'activité</p>
          <p class="value">{{ stats.actif }}</p>
        </div>
        <div class="info-card">
          <p class="label">Jour avec meilleure humeur</p>
          <p class="value">{{ stats.humeur }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  PointElement, LinearScale
} from 'chart.js'
import { Scatter } from 'vue-chartjs'
import { JournalDataService } from '../../services/journalDataService.js'

ChartJS.register(
  Title, Tooltip, Legend,
  PointElement, LinearScale
)

const correlationData = ref([])
const stats = ref({
  correlation: '--',
  actif: '--',
  humeur: '--'
})
const activeData = ref({
  joursActifs: '0/7'
})

const chartData = computed(() => ({
  datasets: [
    {
      label: 'Activité (min) vs Humeur (/10)',
      data: correlationData.value,
      backgroundColor: '#a78bfa',
      borderColor: '#8b5cf6',
      pointRadius: 6,
      pointHoverRadius: 8
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#000',
      bodyColor: '#000',
      callbacks: {
        label: function(context) {
          return `Activité: ${context.parsed.x}min, Humeur: ${context.parsed.y}/10`
        }
      }
    }
  },
  scales: {
    x: {
      title: { display: true, text: 'Activité (minutes)', color: '#666' },
      beginAtZero: true,
      ticks: { color: '#666' },
      grid: { color: '#ccc' }
    },
    y: {
      title: { display: true, text: 'Humeur (/10)', color: '#666' },
      beginAtZero: true,
      max: 10,
      ticks: { color: '#666' },
      grid: { color: '#ccc' }
    }
  }
}

const loadRealData = () => {
  try {
    const { startDate, endDate } = JournalDataService.getCurrentWeekPeriod()
    
    const activityData = JournalDataService.getActivityDataForPeriod(startDate, endDate)
    const moodData = JournalDataService.getMoodDataForPeriod(startDate, endDate)
    
    const correlationChartData = JournalDataService.getCorrelationChartData(startDate, endDate)
    correlationData.value = correlationChartData
    
    stats.value = JournalDataService.calculateCorrelationStats(activityData, moodData)
    
    const joursActifsCount = activityData.filter(day => day.totalDuration > 0 && !day.noActivity).length
    activeData.value.joursActifs = `${joursActifsCount}/7`
    
    console.log('Données de corrélation chargées:', { 
      activityData, 
      moodData, 
      correlationChartData, 
      stats: stats.value,
      activeData: activeData.value
    })
  } catch (error) {
    console.error('Erreur lors du chargement des données de corrélation:', error)
  }
}

defineExpose({
  getStats: () => ({
    ...stats.value,
    joursActifs: activeData.value.joursActifs
  })
})

onMounted(() => {
  loadRealData()
})
</script>

<style scoped>

.chart-container { padding: 1.5rem; }

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }

.chart-wrapper {
  width: 100%;
  max-width: 1500px;
  height: 500px;
  margin: 0 auto;
}

.info-cards {
  background: var(--background-soft);
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: nowrap;
  justify-content: center;
  overflow-x: auto;
  border: 1px solid var(--border-light);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  color: var(--text-primary);
  min-width: 150px;
  text-align: center;
  transition: transform 0.2s;
}

.info-card:hover {
  transform: scale(1.02);
}
.label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.value {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-primary);
}

</style>