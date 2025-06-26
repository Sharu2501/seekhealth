<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'

const user = ref(null)

function handleLoginSuccess(loggedInUser) {
  user.value = loggedInUser
}
</script>

<template>
  <Header @login-success="handleLoginSuccess" />

  <main class="main-content">
    <RouterView :user="user" />
  </main>
</template>

<style scoped>
.main-content {
  padding-top: 100px;
  min-height: 100vh;
}

</style>
