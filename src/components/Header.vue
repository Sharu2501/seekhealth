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

        <div class="separator"></div>

        <!-- Bouton de connexion Microsoft -->
        <!-- Si connecté : affiche les initiales -->
        <div v-if="user" class="user-info-container">
          <div class="user-name-display">{{ userInitials }}</div>
          <button class="logout-btn" @click="logout" title="Se déconnecter" aria-label="Se déconnecter">
            <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        <!-- Sinon : affiche bouton Microsoft -->
        <button v-else @click="loginWithMicrosoft" class="microsoft-btn" title="Connexion Microsoft" aria-label="Connexion Microsoft">
          <svg class="microsoft-icon" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 11.5H1V1h10.5v10.5z" fill="#F25022"/>
            <path d="M22 11.5H11.5V1H22v10.5z" fill="#7FBA00"/>
            <path d="M11.5 22H1V11.5h10.5V22z" fill="#00A4EF"/>
            <path d="M22 22H11.5V11.5H22V22z" fill="#FFB900"/>
          </svg>
        </button>


        <!-- Bouton pour le mode jour ou nuit -->
        <button
          @click="toggleTheme"
          class="theme-toggle"
          :title="themeLabel"
          :aria-label="themeLabel"
        >
          <!-- Icône du soleil -->
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

          <!-- Icône de la lune -->
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
import { signInAndGetUser } from '../lib/microsoftGraph'
import { msalInstance } from '../lib/microsoftGraph'

export default {
  name: 'AnimatedHeader',
  props: {
    user: Object
  },
  setup() {
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
  computed: {
    userInitials() {
      if (!this.user) return ''
      const first = this.user.name || ''
      const last = this.user.username || ''
      return (first[0] || '') + (last[0] || '')
    }
  },
  mounted() {
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
    },
    async loginWithMicrosoft() {
      try {
        const user = await signInAndGetUser()
        this.$emit('login-success', user)
      } catch (error) {
        console.error('Login failed:', error)
      }
    },
    async logout() {
      try {
        await msalInstance.logoutPopup()
        this.$emit('logout')
      } catch (e) {
        console.error('Logout failed:', e)
      }
    }
  }
}
</script>

<style scoped>
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
  width: 800px;
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
  gap: 30px;
  margin-left: auto;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.6s ease 0.3s;
  height: 100%;
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

.microsoft-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.microsoft-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.dark-mode .microsoft-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.microsoft-icon {
  width: 22px;
  height: 22px;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.dark-mode .microsoft-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.microsoft-btn:hover .microsoft-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}

.dark-mode .microsoft-btn:hover .microsoft-icon {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

.user-name-display {
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 20px;
  background-color: rgba(138, 43, 226, 0.1);
  color: #8a2be2;
  transition: all 0.3s ease;
}

.dark-mode .user-name-display {
  color: #e0e0e0;
  background-color: rgba(255, 255, 255, 0.1);
}

.user-info-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 0, 0, 0.1);
  transform: scale(1.05);
}

.logout-icon {
  width: 18px;
  height: 18px;
  color: #8a2be2;
  stroke-width: 2;
}

.dark-mode .logout-icon {
  color: #e0e0e0;
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