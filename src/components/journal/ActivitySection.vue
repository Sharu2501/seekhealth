<template>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">
        <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        Activité Physique
      </h2>
      <p class="section-description">
        Enregistrez vos activités physiques du jour : type, durée et intensité
      </p>
    </div>

    <div class="mb-5">
      <h3 class="text-center mb-4">Activités rapides</h3>
      <div class="grid grid-auto">
        <button
          class="quick-activity-btn rest-option"
          :class="{ 'active': hasNoActivity }"
          @click="setNoActivity"
        >
          <div class="option-emoji">🛋️</div>
          <span class="option-label">Repos</span>
          <span class="activity-duration">Pas d'activité</span>
        </button>

        <button
          v-for="activity in quickActivities"
          :key="activity.id"
          class="quick-activity-btn"
          @click="addQuickActivity(activity)"
          :disabled="hasNoActivity"
        >
          <div class="option-emoji">{{ activity.icon }}</div>
          <span class="option-label">{{ activity.name }}</span>
          <span class="activity-duration">{{ activity.defaultDuration }}min</span>
        </button>
      </div>
    </div>

    <div class="card-gradient mb-5" v-if="!hasNoActivity">
      <h3 class="text-center mb-4">Ajouter une activité personnalisée</h3>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Type d'activité
          </label>
          <select v-model="newActivity.type" class="form-select">
            <option value="">Sélectionnez un type</option>
            <option v-for="type in activityTypes" :key="type.id" :value="type.id">
              {{ type.icon }} {{ type.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            Durée (minutes)
          </label>
          <input
            type="number"
            v-model="newActivity.duration"
            class="form-input"
            placeholder="30"
            min="1"
            max="1440"
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Intensité
          </label>
          <select v-model="newActivity.intensity" class="form-select">
            <option value="">Sélectionnez l'intensité</option>
            <option value="faible">🌱 Faible</option>
            <option value="moderee">🔥 Modérée</option>
            <option value="intense">⚡ Intense</option>
          </select>
        </div>

        <div class="form-group full-width">
          <button
            @click="addCustomActivity"
            class="btn-primary"
            :disabled="!canAddActivity"
          >
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Ajouter l'activité
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des activités -->
    <div class="mb-5" v-if="activiteData.activite.length > 0">
      <h3 class="text-center mb-4">Activités d'aujourd'hui</h3>
      <div class="grid grid-lg">
        <div
          v-for="(activity, index) in activiteData.activite"
          :key="index"
          class="card activity-card"
        >
          <div class="card-header">
            <div class="activity-type">
              <span class="type-icon">{{ getActivityIcon(activity.type) }}</span>
              <span class="type-name">{{ getActivityName(activity.type) }}</span>
            </div>
            <button
              @click="removeActivity(index)"
              class="close-btn"
              title="Supprimer cette activité"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="activity-details">
            <div class="detail-item">
              <span class="detail-icon">⏱️</span>
              <span>{{ activity.duration }} min</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">{{ getIntensityIcon(activity.intensity) }}</span>
              <span>{{ getIntensityLabel(activity.intensity) }}</span>
            </div>
            <div class="detail-item" v-if="activity.calories">
              <span class="detail-icon">🔥</span>
              <span>~{{ activity.calories }} cal</span>
            </div>
          </div>

          <div class="activity-notes" v-if="activity.notes">
            <p>{{ activity.notes }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="card-gradient" v-if="activiteData.activite.length > 0">
      <h3 class="text-center mb-4">Résumé de la journée</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalDuration }}</div>
            <div class="stat-label">Durée totale</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalCalories }}</div>
            <div class="stat-label">Calories estimées</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ activiteData.activite.length }}</div>
            <div class="stat-label">Activités</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <div class="stat-value">{{ dominantIntensity }}</div>
            <div class="stat-label">Intensité dominante</div>
          </div>
        </div>
      </div>
    </div>

    <div class="encouragement" v-if="activiteData.activite.length === 0 && !hasNoActivity">
      <div class="encouragement-icon">💪</div>
      <h3 class="encouragement-title">Prêt à bouger ?</h3>
      <p class="encouragement-text">
        Ajoutez vos activités physiques pour suivre votre progression quotidienne.
        Chaque mouvement compte !
      </p>
    </div>

    <div class="rest-message" v-else-if="hasNoActivity">
      <div class="rest-icon">🛋️</div>
      <h3 class="rest-title">Jour de repos</h3>
      <p class="rest-text">
        Parfait ! Le repos fait partie intégrante d'un mode de vie sain. 
        Votre corps a besoin de récupérer pour être plus fort demain.
      </p>
      <button @click="cancelNoActivity" class="btn-secondary">
        Finalement, j'ai fait une activité
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import '../../assets/journal/activity.css'

const props = defineProps({
  date: { type: String, required: true }
})

const emit = defineEmits(['update'])

const activiteData = ref({ activite: [], noActivity: false })

const newActivity = ref({ type: '', duration: '', intensity: '', notes: '' })

const quickActivities = [
  { id: 'marche', name: 'Marche', icon: '🚶‍♂️', defaultDuration: 30, intensity: 'faible' },
  { id: 'course', name: 'Course', icon: '🏃‍♂️', defaultDuration: 25, intensity: 'moderee' },
  { id: 'velo', name: 'Vélo', icon: '🚴‍♂️', defaultDuration: 45, intensity: 'moderee' },
  { id: 'yoga', name: 'Yoga', icon: '🧘‍♀️', defaultDuration: 45, intensity: 'faible' }
]

const activityTypes = [
  { id: 'marche', name: 'Marche', icon: '🚶‍♂️' },
  { id: 'course', name: 'Course à pied', icon: '🏃‍♂️' },
  { id: 'velo', name: 'Vélo', icon: '🚴‍♂️' },
  { id: 'yoga', name: 'Yoga', icon: '🧘‍♀️' }
]

const caloriesPerMinute = {
  marche: { faible: 3, moderee: 4, intense: 5 },
  course: { faible: 8, moderee: 12, intense: 16 },
  velo: { faible: 6, moderee: 9, intense: 12 },
  yoga: { faible: 2, moderee: 3, intense: 4 }
}

const hasNoActivity = computed(() => activiteData.value.noActivity === true)

const canAddActivity = computed(() => {
  return newActivity.value.type && newActivity.value.duration && newActivity.value.intensity
})

const nbActivity = computed(() => activiteData.value.activite.length)

const calculateCalories = (type, duration, intensity) => {
  const rates = caloriesPerMinute[type] || { faible: 4, moderee: 6, intense: 8 }
  const rate = rates[intensity] || rates.moderee
  return Math.round(rate * Number(duration))
}

const totalDuration = computed(() => {
  const total = activiteData.value.activite.reduce((sum, activity) => sum + Number(activity.duration), 0)
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return hours > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${minutes}min`
})

const totalCalories = computed(() => {
  return activiteData.value.activite.reduce((sum, activity) => {
    const calories = calculateCalories(activity.type, activity.duration, activity.intensity)
    return sum + calories
  }, 0)
})

const dominantIntensity = computed(() => {
  if (activiteData.value.activite.length === 0) return '--'
  const counts = activiteData.value.activite.reduce((acc, a) => {
    acc[a.intensity] = (acc[a.intensity] || 0) + 1
    return acc
  }, {})
  return getIntensityLabel(Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0])
})

const isDataComplete = computed(() => activiteData.value.activite.length > 0)

const addQuickActivity = (activity) => {
  if (hasNoActivity.value) return
  
  const newActivityData = {
    type: activity.id,
    duration: activity.defaultDuration,
    intensity: activity.intensity,
    notes: '',
    calories: calculateCalories(activity.id, activity.defaultDuration, activity.intensity),
    timestamp: new Date().toISOString()
  }
  
  activiteData.value.activite.push(newActivityData)
  updateData()
}

const setNoActivity = () => {
  activiteData.value.noActivity = true
  activiteData.value.activite = []
  updateData()
}

const cancelNoActivity = () => {
  activiteData.value.noActivity = false
  updateData()
}

const addCustomActivity = () => {
  if (!canAddActivity.value || hasNoActivity.value) return
  
  const activity = {
    type: newActivity.value.type,
    duration: parseInt(newActivity.value.duration),
    intensity: newActivity.value.intensity,
    notes: newActivity.value.notes,
    calories: calculateCalories(newActivity.value.type, newActivity.value.duration, newActivity.value.intensity),
    timestamp: new Date().toISOString()
  }
  
  activiteData.value.activite.push(activity)
  newActivity.value = { type: '', duration: '', intensity: '', notes: '' }
  updateData()
}

const removeActivity = (index) => {
  activiteData.value.activite.splice(index, 1)
  updateData()
}

const getActivityIcon = (type) => {
  const activity = activityTypes.find(a => a.id === type)
  return activity ? activity.icon : '🏃‍♀️'
}

const getActivityName = (type) => {
  const activity = activityTypes.find(a => a.id === type)
  return activity ? activity.name : 'Activité'
}

const getIntensityIcon = (intensity) => {
  const icons = { faible: '🌱', moderee: '🔥', intense: '⚡' }
  return icons[intensity] || '🔥'
}

const getIntensityLabel = (intensity) => {
  const labels = { faible: 'Faible', moderee: 'Modérée', intense: 'Intense' }
  return labels[intensity] || 'Modérée'
}

const key = `journal-${userEmailOrGuest()}-${props.date}`

const updateData = () => {
  const savedStr = localStorage.getItem(key)
  let journalData = savedStr ? JSON.parse(savedStr) : {}

  if (!journalData.completions) journalData.completions = {}
  if (!journalData.completions.activite) journalData.completions.activite = {}

  journalData.completions.activite[props.date] = JSON.parse(JSON.stringify(activiteData.value))
  journalData.lastUpdated = new Date().toISOString()
  journalData.activite = {
    nbActivites: activiteData.value.activite.length,
    nomsActivites: activiteData.value.activite.map(a => getActivityName(a.type))
  }
  localStorage.setItem(key, JSON.stringify(journalData))

  emitUpdate()
}

const loadData = () => {
  const savedStr = localStorage.getItem(key)
  if (!savedStr) {
    activiteData.value.activite = []
    activiteData.value.noActivity = false
    activiteData.value.nbActivity = 0
    emitUpdate()
    return
  }

  const journalData = JSON.parse(savedStr)
  if (journalData.completions && journalData.completions.activite && journalData.completions.activite[props.date]) {
    const savedActivite = journalData.completions.activite[props.date]
    activiteData.value.activite = savedActivite.activite || []
    activiteData.value.noActivity = savedActivite.noActivity || false
  } else {
    activiteData.value.activite = []
    activiteData.value.noActivity = false
  }

  activiteData.value.nomsActivites = journalData.activite?.nomsActivites || []

  emitUpdate()
}

const emitUpdate = () => {
  emit('update', 'activite', isDataComplete.value, {
    activite: activiteData.value.activite,
    activityCount: activiteData.value.activite.length,
    noActivity: activiteData.value.noActivity,
    nbActivity: nbActivity.value
  })
}

function userEmailOrGuest() {
  const user = JSON.parse(localStorage.getItem('user')) || null
  return user?.email || 'guest'
}

watch(() => props.date, loadData)
onMounted(loadData)
</script>