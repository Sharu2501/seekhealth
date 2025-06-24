import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const isDarkMode = ref(false)
const isInitialized = ref(false)

export function useTheme() {
  let mediaQuery = null

  const themeClass = computed(() => isDarkMode.value ? 'dark-theme' : 'light-theme')
  const themeIcon = computed(() => isDarkMode.value ? 'moon' : 'sun')
  const themeLabel = computed(() => isDarkMode.value ? 'Mode jour' : 'Mode nuit')

  const loadThemePreference = () => {
    const savedTheme = localStorage.getItem('seekhealth-theme')
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  const saveThemePreference = () => {
    localStorage.setItem('seekhealth-theme', isDarkMode.value ? 'dark' : 'light')
  }

  const applyTheme = () => {
    const html = document.documentElement
    
    html.style.transition = 'background-color 0.3s ease, color 0.3s ease'
    
    if (isDarkMode.value) {
      html.classList.add('dark-theme')
      html.classList.remove('light-theme')
    } else {
      html.classList.add('light-theme')
      html.classList.remove('dark-theme')
    }

    updateMetaThemeColor()
    
    setTimeout(() => {
      html.style.transition = ''
    }, 300)
  }

  const updateMetaThemeColor = () => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    const color = isDarkMode.value ? '#1a1a1a' : '#ffffff'
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color)
    } else {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.name = 'theme-color'
      metaThemeColor.content = color
      document.head.appendChild(metaThemeColor)
    }
  }

  const watchSystemTheme = () => {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e) => {
      if (!localStorage.getItem('seekhealth-theme')) {
        isDarkMode.value = e.matches
        applyTheme()
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    saveThemePreference()
    applyTheme()
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  const setTheme = (theme) => {
    isDarkMode.value = theme === 'dark'
    saveThemePreference()
    applyTheme()
  }

  const initTheme = () => {
    if (!isInitialized.value) {
      loadThemePreference()
      applyTheme()
      isInitialized.value = true
    }
  }

  const cleanup = () => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', () => {})
    }
  }

  onMounted(() => {
    initTheme()
    const cleanupSystemWatch = watchSystemTheme()
    
    onBeforeUnmount(() => {
      cleanup()
      cleanupSystemWatch()
    })
  })

  return {
    isDarkMode: computed(() => isDarkMode.value),
    isInitialized: computed(() => isInitialized.value),
    
    themeClass,
    themeIcon,
    themeLabel,
    
    toggleTheme,
    setTheme,
    initTheme,
    
    applyTheme
  }
}