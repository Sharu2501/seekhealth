// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importer les styles de thème globaux
import './styles/theme.css'

// Importer le composable de thème pour l'initialisation
import { useTheme } from './composables/useTheme'

const app = createApp(App)

app.use(router)

// Initialiser le thème dès le démarrage de l'app
const { initTheme } = useTheme()
initTheme()

app.mount('#app')