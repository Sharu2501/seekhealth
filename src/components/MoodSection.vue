<template>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">
        <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
        Suivi de l'Humeur
      </h2>
      <p class="section-description">
        Comment vous sentez-vous aujourd'hui ? Évaluez votre humeur et notez ce qui l'influence
      </p>
    </div>

    <div class="mb-5">
      <h3 class="mood-title text-center mb-4">Comment vous sentez-vous aujourd'hui ?</h3>
      <div class="option-selector">
        <button
          v-for="mood in moodOptions"
          :key="mood.value"
          class="option-btn"
          :class="{ 'active': humeurData.mainMood === mood.value }"
          @click="selectMainMood(mood.value)"
        >
          <div class="option-emoji" :style="{ fontSize: mood.size || '3rem' }">{{ mood.emoji }}</div>
          <div class="option-label">{{ mood.label }}</div>
          <div class="mood-description">{{ mood.description }}</div>
        </button>
      </div>
    </div>

    <div class="intensity-container card-gradient mb-5" v-if="humeurData.mainMood">
      <h3 class="text-center mb-4">Intensité de cette humeur</h3>
      <div class="intensity-slider-container">
        <div class="intensity-labels mb-2">
          <span>Faible</span>
          <span>Modérée</span>
          <span>Forte</span>
        </div>
        <div class="slider-wrapper">
          <input
            type="range"
            min="1"
            max="10"
            v-model="humeurData.intensity"
            class="intensity-slider"
            @input="updateData"
          />
          <div class="slider-value">{{ humeurData.intensity }}/10</div>
        </div>
      </div>
    </div>

    <div class="mb-5">
      <h3 class="mb-2">Émotions ressenties aujourd'hui</h3>
      <p class="text-secondary mb-4">Sélectionnez toutes les émotions que vous ressentez</p>
      <div class="emotions-grid">
        <button
          v-for="emotion in secondaryEmotions"
          :key="emotion.id"
          class="emotion-tag"
          :class="{ 'active': humeurData.secondaryEmotions.includes(emotion.id) }"
          @click="toggleSecondaryEmotion(emotion.id)"
        >
          <span class="emotion-emoji">{{ emotion.emoji }}</span>
          <span>{{ emotion.name }}</span>
        </button>
      </div>
    </div>

    <div class="mb-5">
      <h3 class="mb-4">Qu'est-ce qui influence votre humeur aujourd'hui ?</h3>
      <div class="grid grid-auto">
        <button
          v-for="factor in influenceFactors"
          :key="factor.id"
          class="option-btn factor-btn"
          :class="{ 
            'active': humeurData.factors.includes(factor.id),
            [factor.type]: true
          }"
          @click="toggleFactor(factor.id)"
        >
          <div class="option-emoji">{{ factor.icon }}</div>
          <div class="option-label">{{ factor.label }}</div>
        </button>
      </div>
    </div>

    <div class="form-group mb-5">
      <label class="form-label">
        <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        Que s'est-il passé aujourd'hui ?
      </label>
      <textarea
        v-model="humeurData.notes"
        class="form-textarea"
        placeholder="Décrivez votre journée, les événements marquants, vos pensées..."
        rows="5"
        @input="updateData"
      ></textarea>
    </div>

    <div class="mood-summary card-gradient" v-if="hasValidData">
      <h3 class="text-center mb-4">Résumé de votre journée</h3>
      <div class="card">
        <div class="summary-main">
          <div class="summary-emoji">{{ getCurrentMoodEmoji() }}</div>
          <div class="summary-content">
            <div class="summary-mood">{{ getCurrentMoodLabel() }}</div>
            <div class="summary-intensity">Intensité: {{ humeurData.intensity }}/10</div>
          </div>
        </div>
        
        <div v-if="humeurData.secondaryEmotions.length > 0" class="mb-3">
          <span class="summary-label">Émotions:</span>
          <div class="summary-emotions">
            <span 
              v-for="emotionId in humeurData.secondaryEmotions" 
              :key="emotionId"
              class="summary-tag"
            >
              {{ getEmotionById(emotionId)?.emoji }} {{ getEmotionById(emotionId)?.name }}
            </span>
          </div>
        </div>

        <div v-if="humeurData.factors.length > 0">
          <span class="summary-label">Influences:</span>
          <div class="summary-factors">
            <span 
              v-for="factorId in humeurData.factors" 
              :key="factorId"
              class="summary-tag"
              :class="getFactorById(factorId)?.type"
            >
              {{ getFactorById(factorId)?.icon }} {{ getFactorById(factorId)?.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import '../assets/journal/mood.css'

const props = defineProps({
  date: { type: String, required: true }
})

const emit = defineEmits(['update'])

const humeurData = ref({
  mainMood: null,
  intensity: 5,
  secondaryEmotions: [],
  factors: [],
  notes: ''
})

const moodOptions = [
  { value: 'terrible', emoji: '😢', label: 'Terrible', description: 'Journée très difficile', size: '3.5rem' },
  { value: 'mauvais', emoji: '😞', label: 'Mauvais', description: 'Pas une bonne journée' },
  { value: 'moyen', emoji: '😐', label: 'Moyen', description: 'Journée normale' },
  { value: 'bon', emoji: '😊', label: 'Bon', description: 'Bonne journée' },
  { value: 'excellent', emoji: '🤩', label: 'Excellent', description: 'Journée fantastique', size: '3.5rem' }
]

const secondaryEmotions = [
  { id: 'joie', name: 'Joie', emoji: '😄' },
  { id: 'gratitude', name: 'Gratitude', emoji: '🙏' },
  { id: 'stress', name: 'Stress', emoji: '😰' },
  { id: 'calme', name: 'Calme', emoji: '😌' }
]

const influenceFactors = [
  { id: 'famille', label: 'Famille', icon: '👨‍👩‍👧‍👦', type: 'neutral' },
  { id: 'travail', label: 'Travail', icon: '💼', type: 'neutral' },
  { id: 'sport', label: 'Sport', icon: '🏃‍♂️', type: 'positive' },
  { id: 'echecs', label: 'Échecs', icon: '❌', type: 'negative' }
]

const hasValidData = computed(() => humeurData.value.mainMood !== null)
const isDataComplete = computed(() => humeurData.value.mainMood !== null && humeurData.value.intensity)

const selectMainMood = (mood) => {
  humeurData.value.mainMood = mood
  updateData()
}

const toggleSecondaryEmotion = (emotionId) => {
  const index = humeurData.value.secondaryEmotions.indexOf(emotionId)
  if (index > -1) {
    humeurData.value.secondaryEmotions.splice(index, 1)
  } else {
    humeurData.value.secondaryEmotions.push(emotionId)
  }
  updateData()
}

const toggleFactor = (factorId) => {
  const index = humeurData.value.factors.indexOf(factorId)
  if (index > -1) {
    humeurData.value.factors.splice(index, 1)
  } else {
    humeurData.value.factors.push(factorId)
  }
  updateData()
}

const getCurrentMoodEmoji = () => {
  const mood = moodOptions.find(m => m.value === humeurData.value.mainMood)
  return mood ? mood.emoji : '--'
}

const getCurrentMoodLabel = () => {
  const mood = moodOptions.find(m => m.value === humeurData.value.mainMood)
  return mood ? mood.label : '--'
}

const getEmotionById = (id) => secondaryEmotions.find(e => e.id === id)
const getFactorById = (id) => influenceFactors.find(f => f.id === id)

const updateData = () => {
  saveData()
  emit('update', 'humeur', isDataComplete.value)
}

const saveData = () => {
  const key = `humeur-${props.date}`
  localStorage.setItem(key, JSON.stringify(humeurData.value))
}

const loadData = () => {
  const key = `humeur-${props.date}`
  const savedData = localStorage.getItem(key)
  if (savedData) {
    humeurData.value = JSON.parse(savedData)
  } else {
    humeurData.value = { mainMood: null, intensity: 5, secondaryEmotions: [], factors: [], notes: '' }
  }
  emit('update', 'humeur', isDataComplete.value)
}

watch(() => props.date, loadData)
onMounted(loadData)
</script>