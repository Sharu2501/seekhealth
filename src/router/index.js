import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
  path: '/statistiques',
  name: 'statistiques',
  component: () => import('../views/StatistiqueView.vue'),
},
  ],
})

export default router