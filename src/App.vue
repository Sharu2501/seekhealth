<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import Header from './components/Header.vue'
import { useTheme } from './composables/useTheme'

const { themeClass } = useTheme()

const user = ref(null)
const router = useRouter()

function handleLoginSuccess(loggedInUser) {
  user.value = loggedInUser
  localStorage.setItem('user', JSON.stringify(loggedInUser))
  router.push('/')
}

function handleLogout() {
  user.value = null
  localStorage.removeItem('user')
  router.push('/')
}

onMounted(() => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser)
    } catch (e) {
      console.warn('Données utilisateur invalides :', e)
    }
  }
})
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
