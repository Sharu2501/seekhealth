import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './styles/theme.css'
import './assets/components.css'
import { useTheme } from './composables/useTheme'

const app = createApp(App)

app.use(router)

const { initTheme } = useTheme()
initTheme()

app.mount('#app')