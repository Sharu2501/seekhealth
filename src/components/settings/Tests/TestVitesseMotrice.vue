<template>
  <div class="test-container">
    <h1>Test de vitesse motrice</h1>
    <p>Appuyez rapidement sur un bouton dès qu’il s'affiche pour évaluer vos réflexes.</p>
    <button @click="finishTest">Terminer le test</button>
  </div>
</template>

<script setup>
import '../assets/journal/tests.css'
const finishTest = () => {
  alert('Test de vitesse motrice terminé.')
}
</script>
