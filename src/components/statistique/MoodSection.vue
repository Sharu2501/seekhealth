<template>
  <div class="chart-container">
    <div class="header">
      <h2>😄 Évolution de l’humeur</h2>
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
        <p class="value">8/ 10</p>
      </div>
      <div class="info-card">
        <p class="label">Jour le plus positif</p>
        <p class="value">Samedi</p>
      </div>
      <div class="info-card">
        <p class="label">Jour le plus bas</p>
        <p class="value">Lundi</p>
      </div>
    
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, BarElement, ArcElement, LineElement,
  PointElement, CategoryScale, LinearScale
} from 'chart.js'

import { Bar, Line, Pie } from 'vue-chartjs'

ChartJS.register(
  Title, Tooltip, Legend,
  BarElement, ArcElement, LineElement, PointElement,
  CategoryScale, LinearScale
)

const currentType = ref('bar')

const chartComponent = computed(() => {
  if (currentType.value === 'line') return Line
  if (currentType.value === 'pie') return Pie
  return Bar
})

const dataValues = [5, 6, 6.5, 6, 7, 8, 6.5]
const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const chartData = computed(() => {
  if (currentType.value === 'pie') {
    return {
      labels,
      datasets: [{
        label: 'Répartition humeur',
        backgroundColor: ['#a78bfa', '#c084fc', '#d8b4fe', '#ddd6fe', '#e9d5ff', '#f3e8ff', '#ede9fe'],
        data: dataValues
      }]
    }
  }

  return {
    labels,
    datasets: [{
      label: 'Humeur (sur 10)',
      backgroundColor: '#c084fc',
      borderColor: '#a78bfa',
      tension: 0.4,
      fill: currentType.value === 'line',
      data: dataValues
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    tooltip: { backgroundColor: '#fff', titleColor: '#000', bodyColor: '#000' }
  },
  scales: currentType.value === 'pie' ? {} : {
    x: {
      title: { display: true, text: 'Jour de la semaine', color: '#666' },
      ticks: { color: '#666' },
      grid: { color: '#ccc' }
    },
    y: {
      title: { display: true, text: 'Note d’humeur', color: '#666' },
      beginAtZero: true,
      max: 10,
      ticks: { color: '#666' },
      grid: { color: '#ccc' }
    }
  }
}))

defineExpose({
  getStats: () => ({
    moyenne: '7.4 / 10',
    positif: 'Vendredi',
    bas: 'Mardi',
    joursSuivis: '7/7'
  })
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
.best-day {
  color: var(--accent-primary);
  font-weight: bold;
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
