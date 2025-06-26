<template>
  <div class="home-container">
    <h1 v-if="user">Bienvenue {{ user.name }} !</h1>
    <h1 v-else>Bienvenue sur SeekHealth !</h1>
  </div>
</template>

<script setup>
defineProps({
  user: Object
})
</script>

<style scoped>
.home-container {
  text-align: center;
  font-size: 24px;
}
</style>
