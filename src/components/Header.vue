
<template>
  <header class="header-container">
    <nav 
      class="navbar" 
      :class="{ 'expanded': isExpanded, 'dark-mode': isDarkMode }"
    >
      <!-- Logo -->
      <div class="logo-container">
        <img 
          src="./img/SeekHealthlogo.png" 
          alt="Logo" 
          class="logo"
        />
      </div>
      
      <div class="menu-items" v-show="isExpanded">
        <RouterLink to="/" class="menu-item" exact-active-class="active">Accueil</RouterLink>
        <RouterLink to="/journal" class="menu-item" active-class="active">Journal</RouterLink>
        <RouterLink to="/statistiques" class="menu-item" active-class="active">Statistiques</RouterLink>
        <RouterLink to="/parametres" class="menu-item" active-class="active">Paramètres</RouterLink>
        
        <!-- Séparateur visuel -->
        <div class="separator"></div>
        
        <!-- Bouton de toggle mode jour/nuit -->
        <button 
          @click="toggleTheme" 
          class="theme-toggle"
          :title="themeLabel"
          :aria-label="themeLabel"
        >
          <!-- Icône soleil (mode jour) -->
          <svg 
            v-if="themeIcon === 'sun'" 
            class="theme-icon sun-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          
          <!-- Icône lune (mode nuit) -->
          <svg 
            v-else 
            class="theme-icon moon-icon" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
      </div>
    </nav>
  </header>
</template>

<script>
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'AnimatedHeader',
  setup() {
    // Utiliser le composable de thème
    const { isDarkMode, themeIcon, themeLabel, toggleTheme } = useTheme()
    
    return {
      isDarkMode,
      themeIcon,
      themeLabel,
      toggleTheme
    }
  },
  data() {
    return {
      isExpanded: false
    }
  },
  mounted() {
    // Animation automatique après 1 seconde
    setTimeout(() => {
      this.expandNavbar()
    }, 1000)
  },
  methods: {
    expandNavbar() {
      this.isExpanded = true
    },
    collapseNavbar() {
      this.isExpanded = false
    }
  }
}
</script>

<style scoped>
/* Tous vos styles CSS restent identiques */
.header-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.navbar {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 12px;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  width: 35px;
  height: 35px;
  
  box-shadow: 
    0 4px 20px rgba(138, 43, 226, 0.3),
    0 8px 40px rgba(138, 43, 226, 0.2);
  
  animation: shadowPulse 3s ease-in-out infinite;
}

.navbar.dark-mode {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 4px 20px rgba(138, 43, 226, 0.4),
    0 8px 40px rgba(138, 43, 226, 0.3);
}

.navbar.expanded {
  width: 600px;
  height: 35px;
  padding: 12px 24px;
  
  box-shadow: 
    0 6px 30px rgba(138, 43, 226, 0.4),
    0 12px 60px rgba(138, 43, 226, 0.3);
}

.navbar.expanded.dark-mode {
  box-shadow: 
    0 6px 30px rgba(138, 43, 226, 0.5),
    0 12px 60px rgba(138, 43, 226, 0.4);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.navbar.expanded .logo-container {
  position: relative;
  left: 0;
  transform: translateX(0);
}

.logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  transition: all 0.4s ease;
}

.menu-items {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.6s ease 0.3s;
}

.navbar.expanded .menu-items {
  opacity: 1;
  transform: translateX(0);
}

.menu-item {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.dark-mode .menu-item {
  color: #e0e0e0;
}

.menu-item.active {
  color: #8a2be2;
  background: rgba(138, 43, 226, 0.15);
  font-weight: 600;
}

.dark-mode .menu-item.active {
  color: #9d4edd;
  background: rgba(157, 78, 221, 0.2);
}

.menu-item:hover {
  color: #8a2be2;
  background: rgba(138, 43, 226, 0.1);
  transform: translateY(-2px);
}

.separator {
  width: 1px;
  height: 24px;
  background: linear-gradient(to bottom, transparent, rgba(138, 43, 226, 0.3), transparent);
  margin: 0 8px;
}

.dark-mode .separator {
  background: linear-gradient(to bottom, transparent, rgba(157, 78, 221, 0.4), transparent);
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #333;
}

.dark-mode .theme-toggle {
  color: #e0e0e0;
}

.theme-toggle:hover {
  background: rgba(138, 43, 226, 0.1);
  transform: scale(1.1);
}

.theme-icon {
  width: 22px;
  height: 22px;
  transition: all 0.3s ease;
}

.sun-icon {
  color: #ffa500;
  animation: rotate 8s linear infinite;
}

.moon-icon {
  color: #4169e1;
  animation: moonGlow 2s ease-in-out infinite alternate;
}

@keyframes shadowPulse {
  0%, 100% {
    box-shadow: 
      0 4px 20px rgba(138, 43, 226, 0.3),
      0 8px 40px rgba(138, 43, 226, 0.2);
  }
  50% {
    box-shadow: 
      0 6px 30px rgba(138, 43, 226, 0.5),
      0 12px 60px rgba(138, 43, 226, 0.4);
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes moonGlow {
  0% { filter: drop-shadow(0 0 5px rgba(65, 105, 225, 0.5)); }
  100% { filter: drop-shadow(0 0 10px rgba(65, 105, 225, 0.8)); }
}

@media (max-width: 768px) {
  .navbar.expanded {
    width: 90vw;
    max-width: 450px;
  }
  
  .menu-items { gap: 12px; }
  .menu-item { font-size: 13px; padding: 6px 12px; }
  .separator { display: none; }
}
</style>