<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'

const user = ref(null)

function handleLoginSuccess(loggedInUser) {
  user.value = loggedInUser
}

function handleLogout() {
  user.value = null
}
</script>

<template>
  <Header
    @login-success="handleLoginSuccess"
    @logout="handleLogout"
    :user="user"
  />

  <main class="main-content">
    <RouterView v-slot="{ Component }">
      <component :is="Component" :user="user" />
    </RouterView>
  </main>
</template>

<style scoped>
.main-content {
  padding-top: 100px;
  min-height: 100vh;
}

</style>
