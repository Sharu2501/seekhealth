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
          <SleepSection
            v-if="activeSection === 'sommeil'"
            :key="'sommeil-' + selectedDate"
            :date="selectedDate"
            @update="updateSectionCompletion"
          />
          <MoodSection
            v-else-if="activeSection === 'humeur'"
            :key="'humeur-' + selectedDate"
            :date="selectedDate"
            @update="updateSectionCompletion"
          />
          <ActivitySection
            v-else-if="activeSection === 'activite'"
            :key="'activite-' + selectedDate"
            :date="selectedDate"
            @update="updateSectionCompletion"
          />
          <FoodSection
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
import SleepSection from '@/components/journal/SleepSection.vue'
import MoodSection from '@/components/journal/MoodSection.vue'
import ActivitySection from '@/components/journal/ActivitySection.vue'
import FoodSection from '@/components/journal/FoodSection.vue'
import '../assets/journal/journal.css'
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

const { user } = defineProps({ user: Object })

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

/**
 * Liste des sections du journal avec leur état de complétion et icône.
 * @type {import('vue').ComputedRef<Array<{ id: string, label: string, icon: object, completed: boolean }>>}
 */
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

/**
 * Date formatée pour affichage (ex: "mardi 9 juillet 2024").
 * @type {import('vue').ComputedRef<string>}
 */
const formattedDate = computed(() => {
  const date = new Date(selectedDate.value)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
})

/**
 * Pourcentage global de sections complétées pour une date donnée.
 * @type {import('vue').ComputedRef<number>}
 */
const completionPercentage = computed(() => {
  const completedSections = Object.values(sectionCompletions.value).filter(Boolean).length
  return Math.round((completedSections / sections.value.length) * 100)
})

const circumferenceMini = computed(() => 2 * Math.PI * 16)

/**
 * Décalage du cercle de progression pour l'indicateur mini (SVG).
 * @type {import('vue').ComputedRef<number>}
 */
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

/**
 * Charge les données de complétion enregistrées localement pour une date spécifique.
 * @param {string} date - Format YYYY-MM-DD
 */
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

/**
 * Sauvegarde l’état de complétion des sections dans le localStorage.
 */
const saveCompletionStatus = () => {
  const data = {
    completions: sectionCompletions.value,
    lastUpdated: new Date().toISOString()
  }
  localStorage.setItem(`journal-${selectedDate.value}`, JSON.stringify(data))
}

/**
 * Gère le focus automatique sur le champ de date quand le sélecteur s’ouvre.
 */
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

watch(activeSection, async () => {
  await nextTick()
  window.scrollTo({ top: 0, behavior: 'smooth' })
})
onMounted(() => {
  loadDataForDate(selectedDate.value)
})
</script>