<template>
  <div class="statistique-view">
    <div class="export-header">
      <div></div>
      <button class="export-button" @click="exporterPDF">📄 Export</button>
    </div>

    <div class="top-graphs">
      <div class="graph-column">
        <SleepSection ref="sleep" />
      </div>
      <div class="graph-column">
        <MoodSection ref="mood" />
      </div>
    </div>

    <div class="bottom-graph">
      <CorrelationSection ref="correlation" />
    </div>
  </div>
</template>

<script setup>
import SleepSection from '@/components/statistiques/SleepSection.vue'
import MoodSection from '@/components/statistiques/MoodSection.vue'
import CorrelationSection from '@/components/statistiques/CorrelationSection.vue'
import { ref } from 'vue'
import jsPDF from 'jspdf'

const sleep = ref(null)
const mood = ref(null)
const correlation = ref(null)

const exporterPDF = () => {
  const doc = new jsPDF()

  const sleepData = sleep.value?.getStats() || {}
  const moodData = mood.value?.getStats() || {}
  const correlationData = correlation.value?.getStats() || {}

  let y = 10
  doc.setFontSize(16)
  doc.text('RAPPORT HEBDOMADAIRE', 10, y)

  y += 10
  doc.setFontSize(12)
  doc.text(` Sommeil :`, 10, y)
  y += 8
  doc.text(`- Moyenne : ${sleepData.moyenne || '--'}`, 10, y)
  y += 6
  doc.text(`- Meilleur jour : ${sleepData.meilleurJour || '--'}`, 10, y)
  y += 6
  doc.text(`- Pire jour : ${sleepData.pireJour || '--'}`, 10, y)
  y += 6
  doc.text(`- Jours suivis : ${sleepData.joursSuivis || '--'}`, 10, y)

  y += 10
  doc.text(` Humeur :`, 10, y)
  y += 8
  doc.text(`- Moyenne : ${moodData.moyenne || '--'}`, 10, y)
  y += 6
  doc.text(`- Jour le plus positif : ${moodData.positif || '--'}`, 10, y)
  y += 6
  doc.text(`- Jour le plus bas : ${moodData.bas || '--'}`, 10, y)
  y += 6
  doc.text(`- Jours suivis : ${moodData.joursSuivis || '--'}`, 10, y)

  y += 10
  doc.text(`Corrélation activité / humeur :`, 10, y)
  y += 8
  doc.text(`- Corrélation estimée : ${correlationData.correlation || '--'}`, 10, y)
  y += 6
  doc.text(`- Jour le plus actif : ${correlationData.actif || '--'}`, 10, y)
  y += 6
  doc.text(`- Jour avec meilleure humeur : ${correlationData.humeur || '--'}`, 10, y)

  doc.save('rapport_seekhealth.pdf')
}
</script>

<style scoped>
.statistique-view {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.export-header {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-bottom: 1rem;
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
  transition:  0.2s;
}

.export-button:hover {
  background: #7e22ce;
}

.top-graphs {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.graph-column {
  flex: 1;
  min-width: 400px;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.bottom-graph {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
