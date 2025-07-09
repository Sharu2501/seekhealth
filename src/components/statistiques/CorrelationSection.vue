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
        <p class="value">+0.72</p>
      </div>
      <div class="info-card">
        <p class="label">Jours actifs</p>
        <p class="value">5 / 7</p>
      </div>
      <div class="info-card">
        <p class="label">Jour avec plus d'activité</p>
        <p class="value">Samedi</p>
      </div>
      <div class="info-card">
        <p class="label">Jour avec meilleure humeur</p>
        <p class="value">Dimanche</p>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  PointElement, LinearScale
} from 'chart.js'

import { Scatter } from 'vue-chartjs'

ChartJS.register(
  Title, Tooltip, Legend,
  PointElement, LinearScale
)

const chartData = {
  datasets: [
    {
      label: 'Activité (min) vs Humeur (/10)',
      data: [
        { x: 30, y: 3.5 },
        { x: 45, y: 4 },
        { x: 60, y: 5.5 },
        { x: 90, y: 7 },
        { x: 80, y: 6.5 },
        { x: 100, y: 8 },
        { x: 0, y: 2 }
      ],
      backgroundColor: '#a78bfa'
    }
  ]
}

const chartOptions = {
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
  scales: {
    x: {
      title: { display: true, text: 'Activité (min)', color: '#666' },
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

defineExpose({
  getStats: () => ({
    correlation: '+0.72',
    actif: 'Samedi',
    humeur: 'Dimanche'
  })
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
