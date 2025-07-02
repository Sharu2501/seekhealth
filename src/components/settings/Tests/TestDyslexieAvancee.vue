<template>
  <div class="test-container">
    <h1>Test avancé de dyslexie</h1>
    <p>Ce test comprend des tâches de lecture, d'écriture et de compréhension.</p>
    <button @click="finishTest">Terminer le test</button>
  </div>
</template>

<script setup>
import '../assets/journal/tests.css'
const finishTest = () => {
  alert('Test avancé de dyslexie terminé.')
}
</script>
