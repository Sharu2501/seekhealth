<template>
  <div class="journal-container">
    <aside class="journal-sidebar" :class="{ 'dark-mode': isDarkMode }">
      <div class="sidebar-item date-selector">
        <button 
          class="sidebar-btn"
          @click="showDatePicker = !showDatePicker"
          :title="formattedDate"
        >
          <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </button>
        
        <div v-if="showDatePicker" class="date-popup" @click.stop>
          <input 
            type="date" 
            v-model="selectedDate" 
            class="date-input"
            @change="onDateChange"
            @blur="showDatePicker = false"
            ref="dateInput"
          />
        </div>
      </div>

      <div class="sidebar-separator"></div>

      <nav class="sidebar-navigation">
        <div
          v-for="section in sections"
          :key="section.id"
          class="sidebar-item"
        >
          <button
            class="sidebar-btn"
            :class="{ 
              'active': activeSection === section.id, 
              'completed': section.completed 
            }"
            @click="setActiveSection(section.id)"
            :title="section.label"
          >
            <svg v-if="section.id === 'sommeil'" class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else-if="section.id === 'humeur'" class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <svg v-else-if="section.id === 'activite'" class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <svg v-else-if="section.id === 'alimentation'" class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
            
            <div class="completion-dot" v-if="section.completed"></div>
          </button>
        </div>
      </nav>

      <div class="sidebar-separator"></div>

      <div class="sidebar-item progress-item">
        <div class="progress-circle-mini">
          <svg class="progress-ring-mini" width="40" height="40">
            <circle
              class="progress-ring-background"
              stroke="rgba(138, 43, 226, 0.2)"
              stroke-width="3"
              fill="transparent"
              r="16"
              cx="20"
              cy="20"
            />
            <circle
              class="progress-ring-progress"
              stroke="url(#gradient-mini)"
              stroke-width="3"
              fill="transparent"
              r="16"
              cx="20"
              cy="20"
              :stroke-dasharray="circumferenceMini"
              :stroke-dashoffset="strokeDashoffsetMini"
            />
            <defs>
              <linearGradient id="gradient-mini" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:var(--accent-primary);stop-opacity:1" />
                <stop offset="100%" style="stop-color:var(--accent-secondary);stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
          <div class="progress-text-mini">
            <span class="progress-percentage-mini">{{ completionPercentage }}%</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="journal-content">
      <div class="content-header">
        <div class="title-section">
          <h1 class="content-title">{{ currentSectionTitle }}</h1>
          <p class="content-subtitle">{{ formattedDate }}</p>
        </div>
      </div>

      <div class="content-body">
        <transition name="fade" mode="out-in">
          <SommeilSection 
            v-if="activeSection === 'sommeil'"
            :key="'sommeil-' + selectedDate"
            :date="selectedDate"
            @update="updateSectionCompletion"
          />
          <HumeurSection 
            v-else-if="activeSection === 'humeur'"
            :key="'humeur-' + selectedDate"
            :date="selectedDate"
            @update="updateSectionCompletion"
          />
          <ActiviteSection 
            v-else-if="activeSection === 'activite'"
            :key="'activite-' + selectedDate"
            :date="selectedDate"
            @update="updateSectionCompletion"
          />
          <AlimentationSection 
            v-else-if="activeSection === 'alimentation'"
            :key="'alimentation-' + selectedDate"
            :date="selectedDate"
            @update="updateSectionCompletion"
          />
        </transition>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import SommeilSection from '@/components/SommeilSection.vue'
import HumeurSection from '@/components/HumeurSection.vue'
import ActiviteSection from '@/components/ActiviteSection.vue'
import AlimentationSection from '@/components/AlimentationSection.vue'

const isDarkMode = ref(false)

const MoonIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`
}

const SmileIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>`
}

const ActivityIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>`
}

const FoodIcon = {
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>`
}

defineProps({ user: Object })

const activeSection = ref('sommeil')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showDatePicker = ref(false)
const dateInput = ref(null)
const sectionCompletions = ref({
  sommeil: false,
  humeur: false,
  activite: false,
  alimentation: false
})

const sections = computed(() => [
  { id: 'sommeil', label: 'Sommeil', icon: MoonIcon, completed: sectionCompletions.value.sommeil },
  { id: 'humeur', label: 'Humeur', icon: SmileIcon, completed: sectionCompletions.value.humeur },
  { id: 'activite', label: 'Activité physique', icon: ActivityIcon, completed: sectionCompletions.value.activite },
  { id: 'alimentation', label: 'Alimentation', icon: FoodIcon, completed: sectionCompletions.value.alimentation }
])

const currentSectionTitle = computed(() => {
  const section = sections.value.find(s => s.id === activeSection.value)
  return section ? section.label : ''
})

const formattedDate = computed(() => {
  const date = new Date(selectedDate.value)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const completionPercentage = computed(() => {
  const completedSections = Object.values(sectionCompletions.value).filter(Boolean).length
  return Math.round((completedSections / sections.value.length) * 100)
})

const circumferenceMini = computed(() => 2 * Math.PI * 16)
const strokeDashoffsetMini = computed(() => {
  const progress = completionPercentage.value / 100
  return circumferenceMini.value - (progress * circumferenceMini.value)
})

const setActiveSection = (sectionId) => {
  activeSection.value = sectionId
}

const onDateChange = () => {
  loadDataForDate(selectedDate.value)
  showDatePicker.value = false
}

const updateSectionCompletion = (sectionId, isCompleted) => {
  sectionCompletions.value[sectionId] = isCompleted
  saveCompletionStatus()
}

const loadDataForDate = (date) => {
  const savedData = localStorage.getItem(`journal-${date}`)
  if (savedData) {
    const data = JSON.parse(savedData)
    sectionCompletions.value = { ...sectionCompletions.value, ...data.completions }
  } else {
    Object.keys(sectionCompletions.value).forEach(key => {
      sectionCompletions.value[key] = false
    })
  }
}

const saveCompletionStatus = () => {
  const data = {
    completions: sectionCompletions.value,
    lastUpdated: new Date().toISOString()
  }
  localStorage.setItem(`journal-${selectedDate.value}`, JSON.stringify(data))
}

// Watch for date picker focus
watch(showDatePicker, async (newValue) => {
  if (newValue) {
    await nextTick()
    if (dateInput.value) {
      dateInput.value.focus()
    }
  }
})

watch(selectedDate, (newDate) => {
  loadDataForDate(newDate)
})

onMounted(() => {
  loadDataForDate(selectedDate.value)
})
</script>

<style scoped>
.journal-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding-top: 100px;
  padding-left: 20px;
}

.journal-sidebar {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  padding: 16px 12px;
  border: 1px solid rgba(138, 43, 226, 0.2);
  
  box-shadow:
    0 8px 32px rgba(138, 43, 226, 0.3),
    0 4px 16px rgba(138, 43, 226, 0.2);
  
  animation: sidebarPulse 3s ease-in-out infinite;
}

.journal-sidebar.dark-mode {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(157, 78, 221, 0.2);
  box-shadow:
    0 8px 32px rgba(138, 43, 226, 0.4),
    0 4px 16px rgba(138, 43, 226, 0.3);
}

.sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.sidebar-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(45deg, transparent, rgba(138, 43, 226, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sidebar-btn:hover::before {
  opacity: 1;
}

.sidebar-btn:hover {
  background: rgba(138, 43, 226, 0.1);
  transform: scale(1.1);
}

.sidebar-btn.active {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.4);
  transform: scale(1.1);
}

.sidebar-btn.completed:not(.active) {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.sidebar-icon {
  width: 24px;
  height: 24px;
  color: var(--accent-primary);
  transition: color 0.3s ease;
}

.sidebar-btn.active .sidebar-icon,
.sidebar-btn.completed .sidebar-icon {
  color: white;
}

.completion-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.sidebar-separator {
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, transparent, rgba(138, 43, 226, 0.3), transparent);
  border-radius: 1px;
  margin: 4px 0;
}

.dark-mode .sidebar-separator {
  background: linear-gradient(to bottom, transparent, rgba(157, 78, 221, 0.4), transparent);
}

/* NAVIGATION */
.sidebar-navigation {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* DATE PICKER */
.date-selector {
  position: relative;
}

.date-popup {
  position: absolute;
  top: 0;
  left: 60px;
  background: var(--bg-primary);
  border: 2px solid rgba(138, 43, 226, 0.2);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(138, 43, 226, 0.2);
  z-index: 1001;
}

.date-input {
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  font-size: 0.875rem;
  outline: none;
  width: 140px;
}

/* PROGRESS MINI */
.progress-item {
  margin-top: 8px;
}

.progress-circle-mini {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.progress-ring-mini {
  transform: rotate(-90deg);
}

.progress-ring-progress {
  transition: stroke-dashoffset 0.8s ease;
  stroke-linecap: round;
}

.progress-text-mini {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.progress-percentage-mini {
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  color: var(--accent-primary);
  line-height: 1;
}

.journal-content {
  flex: 1;
  margin-left: 100px;
  padding: 20px;
  transition: all 0.3s ease;
}

.content-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.title-section {
  flex: 1;
}

.content-title {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  line-height: 1.2;
}

.content-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  margin: 8px 0 0 0;
  text-transform: capitalize;
}

.content-body {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(138, 43, 226, 0.1);
  border: 1px solid rgba(138, 43, 226, 0.1);
  min-height: 500px;
}

.dark-theme .content-body {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(157, 78, 221, 0.2);
}

/* ANIMATIONS */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes sidebarPulse {
  0%, 100% {
    box-shadow:
      0 8px 32px rgba(138, 43, 226, 0.3),
      0 4px 16px rgba(138, 43, 226, 0.2);
  }
  50% {
    box-shadow:
      0 12px 48px rgba(138, 43, 226, 0.5),
      0 6px 24px rgba(138, 43, 226, 0.4);
  }
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .journal-content {
    margin-left: 90px;
  }
}

@media (max-width: 768px) {
  .journal-container {
    padding-left: 10px;
    padding-top: 120px;
  }
  
  .journal-sidebar {
    left: 10px;
    position: relative;
    top: auto;
    transform: none;
    margin-bottom: 20px;
    flex-direction: row;
    width: calc(100% - 20px);
    height: auto;
    padding: 12px 16px;
  }
  
  .sidebar-navigation {
    flex-direction: row;
  }
  
  .sidebar-separator {
    width: 20px;
    height: 2px;
    background: linear-gradient(to right, transparent, rgba(138, 43, 226, 0.3), transparent);
  }
  
  .journal-content {
    margin-left: 0;
  }
  
  .content-title {
    font-size: 2rem;
  }
}
</style>