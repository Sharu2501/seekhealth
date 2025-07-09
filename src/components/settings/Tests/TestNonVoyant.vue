<template>
  <div class="test-container">
    <h1>Test handicap non voyant</h1>
    <p>Ce test est conçu avec des options vocales ou braille simulées.</p>
    <button @click="finishTest">Terminer le test</button>
  </div>
</template>

<script setup>
import '../assets/journal/tests.css'
const finishTest = () => {
  alert('Test non voyant terminé.')
}
</script>
