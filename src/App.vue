<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import Header from './components/Header.vue'
</script>

<template>
  <Header></Header>

 <main class="main-content">
    <RouterView />
  </main>
</template>

<style scoped>
.main-content {
  padding-top: 100px;
  min-height: 100vh;
}

</style>
