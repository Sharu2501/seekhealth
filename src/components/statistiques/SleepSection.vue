<template>
  <div class="chart-container">
    <div class="header">
      <h2>🛌 Qualité du sommeil</h2>
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
          <p class="label">Jour le plus reposant</p>
          <p class="value">{{ stats.meilleurJour }}</p>
        </div>
        <div class="info-card">
          <p class="label">Jour le moins reposant</p>
          <p class="value">{{ stats.pireJour }}</p>
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
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

import { Bar, Line, Pie } from 'vue-chartjs'
import { JournalDataService } from '@/services/journalDataService.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)

const currentType = ref('bar')
const sleepData = ref([])
const stats = ref({
  moyenne: '--',
  meilleurJour: '--',
  pireJour: '--',
  joursSuivis: '--'
})

const chartComponent = computed(() => {
  switch (currentType.value) {
    case 'bar': return Bar
    case 'line': return Line
    case 'pie': return Pie
    default: return Bar
  }
})

const chartData = computed(() => {
  const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const data = sleepData.value.map(entry => entry?.value ?? 0)

  if (currentType.value === 'pie') {
    return {
      labels,
      datasets: [{
        label: 'Répartition des heures de sommeil',
        backgroundColor: ['#a78bfa', '#c084fc', '#d8b4fe', '#ddd6fe', '#e9d5ff', '#f3e8ff', '#ede9fe'],
        data
      }]
    }
  }

  return {
    labels,
    datasets: [{
      label: 'Heures de sommeil',
      backgroundColor: '#a78bfa',
      borderColor: '#8b5cf6',
      tension: 0.4,
      fill: currentType.value === 'line',
      data
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
      bodyColor: '#000'
    }
  },
  scales: currentType.value === 'pie' ? {} : {
    x: {
      title: { display: true, text: 'Jour de la semaine', color: '#666' },
      ticks: { color: '#666' },
      grid: { color: '#ccc' }
    },
    y: {
      title: { display: true, text: 'Heures de sommeil', color: '#666' },
      beginAtZero: true,
      ticks: { color: '#666' },
      grid: { color: '#ccc' }
    }
  }
}))

function calculateSleepStats(data) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const values = data.map(d => d.value)
  const valid = data.filter(d => d.value !== null && d.value !== undefined)

  if (valid.length === 0) return

  const total = valid.reduce((sum, d) => sum + d.value, 0)
  const moyenne = (total / valid.length).toFixed(1)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const meilleurJour = days[values.indexOf(max)]
  const pireJour = days[values.indexOf(min)]

  stats.value = {
    moyenne: `${moyenne} h`,
    meilleurJour,
    pireJour,
    joursSuivis: `${valid.length} / 7`
  }
}

onMounted(() => {
  try {
    const { startDate, endDate } = JournalDataService.getCurrentWeekPeriod()
    const rawChartData = JournalDataService.getSleepChartData(startDate, endDate)

    sleepData.value = rawChartData.labels.map((label, index) => ({
      label,
      value: rawChartData.values[index] ?? null
    }))

    calculateSleepStats(sleepData.value)
  } catch (error) {
    console.error('Erreur chargement données sommeil :', error)
  }
})

defineExpose({
  getStats: () => stats.value
})
</script>

<style scoped>
.chart-container { padding: 1.5rem; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-switch {
  display: flex;
  gap: 0.5rem;
}

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