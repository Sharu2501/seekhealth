<template>
  <div class="test-container">
    <h1>Test de dépistage du cancer</h1>
    <p>Ce test vous posera quelques questions relatives à vos antécédents médicaux.</p>
    <button @click="finishTest">Terminer le test</button>
  </div>
</template>

<script setup>
import '@/assets/tests.css'
const finishTest = () => {
  alert('Test de dépistage du cancer terminé.')
}
</script>