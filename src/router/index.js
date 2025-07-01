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
  path: '/statistiques',
  name: 'statistiques',
  component: () => import('../views/StatistiqueView.vue'),
},
  ],
})

export default router