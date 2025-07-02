import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        resolve()
      }, 100)
    })
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/journal',
      name: 'journal',
      component: () => import('../views/JournalView.vue'),
    },
    {
      path: '/parametres',
      name: 'parametres',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/settings/history',
      name: 'history',
      component: () => import('../components/settings/HistoryView.vue'),
    },
    {
      path: '/settings/cancer',
      name: 'cancer',
      component: () => import('../components/settings/Tests/TestCancer.vue'),
    },
  ],
})

export default router