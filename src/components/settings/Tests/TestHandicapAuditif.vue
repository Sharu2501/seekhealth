<template>
  <div class="test-container">
    <h1>Test handicap auditif</h1>
    <p>Ce test vous demandera de lire et interpréter des instructions écrites.</p>
    <button @click="finishTest">Terminer le test</button>
  </div>
</template>

<script setup>
import '../assets/journal/tests.css'
const finishTest = () => {
  alert('Test handicap auditif terminé.')
}
</script>