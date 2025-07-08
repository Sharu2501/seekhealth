<template>
  <div class="chart-container">
    <div class="header">
      <h2>😄 Évolution de l'humeur</h2>
      <div class="chart-switch">
        <button @click="currentType = 'bar'" :class="{ active: currentType === 'bar' }">📊</button>
        <button @click="currentType = 'line'" :class="{ active: currentType === 'line' }">📈</button>
        <button @click="currentType = 'pie'" :class="{ active: currentType === 'pie' }">🥧</button>
      </div>
    </div>

    <div class="chart-wrapper">
      <component :is="chartComponent" :data="chartData" :options="chartOptions" />
      <div class="info-cards">
        <div class="info-card">
          <p class="label">Note moyenne</p>
          <p class="value">{{ stats.moyenne }}</p>
        </div>
        <div class="info-card">
          <p class="label">Jour le plus positif</p>
          <p class="value">{{ stats.positif }}</p>
        </div>
        <div class="info-card">
          <p class="label">Jour le plus bas</p>
          <p class="value">{{ stats.bas }}</p>
        </div>
        <div class="info-card">
          <p class="label">Jours suivis</p>
          <p class="value">{{ stats.joursSuivis }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, BarElement, ArcElement, LineElement,
  PointElement, CategoryScale, LinearScale
} from 'chart.js'
import { Bar, Line, Pie } from 'vue-chartjs'
import { JournalDataService } from '../../services/journalDataService.js'

ChartJS.register(
  Title, Tooltip, Legend,
  BarElement, ArcElement, LineElement, PointElement,
  CategoryScale, LinearScale
)

const currentType = ref('bar')
const realData = ref({ labels: [], values: [] })
const stats = ref({
  moyenne: '--',
  positif: '--',
  bas: '--',
  joursSuivis: '0/7'
})

const chartComponent = computed(() => {
  if (currentType.value === 'line') return Line
  if (currentType.value === 'pie') return Pie
  return Bar
})

const chartData = computed(() => {
  if (currentType.value === 'pie') {
    return {
      labels: realData.value.labels,
      datasets: [{
        label: 'Répartition humeur',
        backgroundColor: ['#a78bfa', '#c084fc', '#d8b4fe', '#ddd6fe', '#e9d5ff', '#f3e8ff', '#ede9fe'],
        data: realData.value.values
      }]
    }
  }

  return {
    labels: realData.value.labels,
    datasets: [{
      label: 'Humeur (sur 10)',
      backgroundColor: '#c084fc',
      borderColor: '#a78bfa',
      tension: 0.4,
      fill: currentType.value === 'line',
      data: realData.value.values
    }]
  }
})

const chartOptions = computed(() => ({
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
          return `Humeur: ${context.parsed.y}/10`
        }
      }
    }
  },
  scales: currentType.value === 'pie' ? {} : {
    x: {
      title: { display: true, text: 'Jour de la semaine', color: '#666' },
      ticks: { color: '#666' },
      grid: { color: '#ccc' }
    },
    y: {
      title: { display: true, text: "Note d'humeur", color: '#666' },
      beginAtZero: true,
      max: 10,
      ticks: { color: '#666' },
      grid: { color: '#ccc' }
    }
  }
}))

const loadRealData = () => {
  try {
    const { startDate, endDate } = JournalDataService.getCurrentWeekPeriod()
    
    // Charge les données d'humeur
    const moodData = JournalDataService.getMoodDataForPeriod(startDate, endDate)
    
    // Obtient les données formatées pour le graphique
    const chartData = JournalDataService.getMoodChartData(startDate, endDate)
    realData.value = chartData
    
    // Calcule les statistiques
    stats.value = JournalDataService.calculateMoodStats(moodData)
    
    console.log('Données d\'humeur chargées:', { moodData, chartData, stats: stats.value })
  } catch (error) {
    console.error('Erreur lors du chargement des données d\'humeur:', error)
    // Garde les valeurs par défaut en cas d'erreur
  }
}

defineExpose({
  getStats: () => stats.value
})

onMounted(() => {
  loadRealData()
})
</script>

<style scoped>
.chart-container { padding: 1.5rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.chart-switch { display: flex; gap: 0.5rem; }
.chart-switch button {
  font-size: 1.25rem;
  background-color: transparent;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.chart-switch button.active,
.chart-switch button:hover {
  background-color: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}
.chart-wrapper {
  width: 100%;              
  max-width: 1500px;
  height: 500px;
  margin: 0 auto;
}
.info-cards {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}
.info-card {
  background: var(--background-soft);
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