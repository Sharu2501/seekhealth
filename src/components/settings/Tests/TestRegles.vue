<template>
  <div class="test-container">
    <h1>Test sur les règles</h1>
    <p>Répondez aux questions pour mieux comprendre vos cycles menstruels.</p>
    <button @click="finishTest">Terminer le test</button>
  </div>
</template>

<script setup>
import '../assets/journal/tests.css'
const finishTest = () => {
  alert('Test sur les règles terminé.')
}
</script>
