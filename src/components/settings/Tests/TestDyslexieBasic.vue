<template>
  <div class="test-container">
    <h1>Test basique de dyslexie</h1>
    <p>Identifiez les lettres, mots ou chiffres présentés.</p>
    <button @click="finishTest">Terminer le test</button>
  </div>
</template>

<script setup>
import '../assets/journal/tests.css'
const finishTest = () => {
  alert('Test basique de dyslexie terminé.')
}
</script>