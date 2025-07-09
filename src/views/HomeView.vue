<template>
  <div class="home-wrapper">
    <div class="home-welcome">
      <h1 class="home-title">
        {{ user ? `Bienvenue ${user.name} !` : "Bienvenue sur SeekHealth !" }}
      </h1>
      <p class="home-subtitle">
        Suivez votre bien-être au quotidien et complétez votre journal de santé.
      </p>

      <img src="@/components/img/logo-seek-health.png" alt="Logo SeekHealth" class="logo-between" />
    </div>

    <div class="sections-grid">
      <div
        v-for="(completed, section) in sectionCompletions"
        :key="section"
        :class="['section-card', completed ? 'completed' : '']"
      >
        <div class="icon">
          <span v-if="section === 'sommeil'">🛌</span>
          <span v-else-if="section === 'humeur'">😊</span>
          <span v-else-if="section === 'activite'">🏃‍♂️</span>
          <span v-else-if="section === 'alimentation'">🥗</span>
        </div>
        <div class="section-name">{{ section.charAt(0).toUpperCase() + section.slice(1) }}</div>
      </div>
    </div>

    <div class="home-dashboard">
      <div class="home-progress-card">
        <h2 class="card-title">Progression du jour</h2>
        <div class="progress-ring-container">
          <svg class="progress-ring" width="100" height="100">
            <circle
              class="progress-ring-background"
              stroke="#e0e0e0"
              stroke-width="8"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              class="progress-ring-foreground"
              stroke="url(#gradient)"
              stroke-width="8"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="strokeDashoffset"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#8A2BE2"/>
                <stop offset="100%" stop-color="#6A5ACD"/>
              </linearGradient>
            </defs>
          </svg>
          <div class="progress-center-text">
            <span>{{ completionPercentage }}%</span>
          </div>
        </div>
        <p class="card-subtitle">Sections complétées aujourd’hui</p>
      </div>

      <div class="home-actions">
        <router-link to="/journal" class="action-button">
          📝 Accéder au journal
        </router-link>
        <router-link to="/statistiques" class="action-button secondary">
          📊 Voir les statistiques
        </router-link>
      </div>
    </div>

    <div class="floating-bubbles">
      <div class="bubble" v-for="i in 15" :key="i" :style="{'--i': i}"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  user: Object
})

const sectionCompletions = ref({
  sommeil: false,
  humeur: false,
  activite: false,
  alimentation: false
})

const circumference = computed(() => 2 * Math.PI * 45)
const completionPercentage = computed(() => {
  const completed = Object.values(sectionCompletions.value).filter(Boolean).length
  return Math.round((completed / 4) * 100)
})
const strokeDashoffset = computed(() => {
  return circumference.value - (completionPercentage.value / 100) * circumference.value
})

onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  const saved = localStorage.getItem(`journal-${today}`)
  if (saved) {
    const data = JSON.parse(saved)
    sectionCompletions.value = { ...sectionCompletions.value, ...data.completions }
  }
})
</script>

<style scoped>
.home-wrapper {
  position: relative;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.home-welcome {
  text-align: center;
  margin-bottom: 2rem;
  z-index: 10;
  position: relative;
}

.home-title {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.home-subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.logo-between {
  display: block;
  margin: 1rem auto 2rem auto;
  width: 200px;
  height: auto;
  object-fit: contain;
}

/* --- Grille Sections --- */
.sections-grid {
  grid-template-columns: repeat(4, 140px);
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
  z-index: 10;
  position: relative;
}

.section-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: 1rem;
  text-align: center;
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: var(--font-weight-semibold);
  font-size: 1.1rem;
}

.section-card .icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  animation: bounce 2s infinite;
}

.section-card.completed {
  background: linear-gradient(135deg, #6a5acd, #8a2be2);
  color: white;
  box-shadow: 0 0 12px #6a5acd;
  animation: glow 1.5s infinite alternate;
}

.section-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 6px 12px rgba(138, 43, 226, 0.6);
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes glow {
  0% { box-shadow: 0 0 8px #6a5acd; }
  100% { box-shadow: 0 0 20px #8a2be2; }
}

.home-dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 320px;
  z-index: 10;
  position: relative;
}

.home-progress-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
  text-align: center;
  width: 100%;
  position: relative;
}

.card-title {
  font-size: 1.2rem;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.progress-ring-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 1rem auto;
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-background {
  stroke: var(--border-light);
}

.progress-ring-foreground {
  transition: stroke-dashoffset 0.5s ease;
  stroke-linecap: round;
  stroke: url(#gradient);
}

.progress-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: var(--font-weight-bold);
  font-size: 1.2rem;
  color: var(--text-primary);
}

.card-subtitle {
  margin-top: 0.5rem;
  color: var(--text-muted);
}

.home-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.action-button {
  background: linear-gradient(to right, #8A2BE2, #6A5ACD);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  transition: transform 0.2s, background-color 0.3s ease;
  text-align: center;
  flex: 1 1 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.action-button.secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-button:hover {
  transform: scale(1.05);
  background: linear-gradient(to right, var(--accent-hover), var(--accent-primary));
  color: white;
}

body.dark-theme .home-progress-card {
  box-shadow: var(--shadow-lg);
}

body.dark-theme .progress-ring-background {
  stroke: var(--border-medium);
}

body.dark-theme .card-subtitle {
  color: var(--text-secondary);
}

body.dark-theme .action-button.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

body.dark-theme .action-button.secondary:hover {
  background: var(--accent-primary);
  color: white;
}

.floating-bubbles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
}

.bubble {
  position: absolute;
  bottom: -40px;
  width: calc(10px + var(--i) * 2px);
  height: calc(10px + var(--i) * 2px);
  background: linear-gradient(135deg, #8A2BE2, #6A5ACD);
  border-radius: 50%;
  opacity: calc(0.3 + var(--i) / 15);
  animation: floatUp 8s linear infinite;
  animation-delay: calc(var(--i) * -0.8s);
  filter: drop-shadow(0 0 4px #6a5acd);
  left: calc((var(--i) * 6.6vw) % 100vw);
}

@keyframes floatUp {
  0% {
    transform: translateX(0) translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateX(15px) translateY(-50vh) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0) translateY(-110vh) scale(0.5);
    opacity: 0;
  }
}
</style>
