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
  // ... autres émotions
]

const influenceFactors = [
  { id: 'famille', label: 'Famille', icon: '👨‍👩‍👧‍👦', type: 'neutral' },
  { id: 'travail', label: 'Travail', icon: '💼', type: 'neutral' },
  { id: 'sport', label: 'Sport', icon: '🏃‍♂️', type: 'positive' },
  { id: 'echecs', label: 'Échecs', icon: '❌', type: 'negative' }
  // ... autres facteurs
]

// Computed
const hasValidData = computed(() => humeurData.value.mainMood !== null)
const isDataComplete = computed(() => humeurData.value.mainMood !== null && humeurData.value.intensity)

// Methods
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

<style scoped>
.mood-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.mood-description {
  font-size: 0.875rem;
  opacity: 0.8;
  font-weight: var(--font-weight-normal);
}

.intensity-container {
  padding: 2rem;
  border-radius: var(--radius-lg);
}

.intensity-slider-container {
  max-width: 500px;
  margin: 0 auto;
}

.intensity-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.slider-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.intensity-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(138, 43, 226, 0.2);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.intensity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(138, 43, 226, 0.3);
}

.slider-value {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: var(--font-weight-bold);
  font-size: 0.875rem;
}

.emotions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.emotion-tag {
  background: var(--bg-primary);
  border: 2px solid rgba(138, 43, 226, 0.2);
  border-radius: 25px;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
}

.emotion-tag:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.emotion-tag.active {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-color: var(--accent-primary);
  color: white;
}

.factor-btn.active.positive {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.factor-btn.active.negative {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.summary-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(138, 43, 226, 0.1);
}

.summary-emoji {
  font-size: 4rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.summary-mood {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.summary-intensity {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.summary-label {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  display: block;
}

.summary-emotions, .summary-factors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.summary-tag {
  background: rgba(138, 43, 226, 0.1);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
}

.summary-tag.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.summary-tag.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

@media (max-width: 768px) {
  .summary-main {
    flex-direction: column;
    text-align: center;
  }
}
</style>