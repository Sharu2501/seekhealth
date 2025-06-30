<template>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">
        <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          <line x1="6" y1="1" x2="6" y2="4"/>
          <line x1="10" y1="1" x2="10" y2="4"/>
          <line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
        Suivi Alimentaire
      </h2>
      <p class="section-description">
        Enregistrez vos repas de la journée avec des photos ou des notes détaillées
      </p>
    </div>

    <div class="meals-timeline mb-5">
      <div
        v-for="mealType in mealTypes"
        :key="mealType.id"
        class="meal-section card"
        :class="{ 'has-content': getMealData(mealType.id).length > 0 }"
      >
        <div class="meal-header card-header">
          <div class="meal-info">
            <div class="meal-icon">{{ mealType.icon }}</div>
            <div class="meal-details">
              <h3 class="meal-title">{{ mealType.name }}</h3>
              <span class="meal-time">{{ mealType.time }}</span>
            </div>
          </div>
          <button
            @click="openMealForm(mealType.id)"
            class="add-meal-btn"
            :title="`Ajouter ${mealType.name.toLowerCase()}`"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <!-- Éléments du repas -->
        <div class="meal-items" v-if="getMealData(mealType.id).length > 0">
          <div
            v-for="(item, index) in getMealData(mealType.id)"
            :key="index"
            class="meal-item"
          >
            <div class="item-photo" v-if="item.photo">
              <img :src="item.photo" :alt="item.description" class="food-photo" />
              <button
                @click="viewPhoto(item.photo)"
                class="view-photo-btn"
                title="Voir en grand"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            
            <div class="item-content">
              <div class="item-description">{{ item.description }}</div>
              <div class="item-metadata">
                <span class="item-time">{{ formatTime(item.timestamp) }}</span>
                <span class="item-quality" :class="item.quality">
                  {{ getQualityIcon(item.quality) }} {{ getQualityLabel(item.quality) }}
                </span>
              </div>
              <div class="item-notes" v-if="item.notes">{{ item.notes }}</div>
            </div>

            <button
              @click="removeMealItem(mealType.id, index)"
              class="close-btn"
              title="Supprimer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- État vide -->
        <div class="empty-meal" v-else>
          <div class="empty-icon">🍽️</div>
          <p class="empty-text">Aucun aliment ajouté pour {{ mealType.name.toLowerCase() }}</p>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showMealForm" @click="closeMealForm">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Ajouter {{ getCurrentMealName() }}</h3>
          <button @click="closeMealForm" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-content">
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Photo du repas (optionnel)
            </label>
            
            <div class="photo-upload-area" :class="{ 'has-photo': newMealItem.photo }">
              <input
                type="file"
                ref="photoInput"
                accept="image/*"
                @change="handlePhotoUpload"
                style="display: none"
              />
              
              <div v-if="!newMealItem.photo" class="upload-placeholder" @click="$refs.photoInput.click()">
                <div class="upload-icon">📸</div>
                <p class="upload-text">Cliquez pour prendre une photo</p>
              </div>
              
              <div v-else class="photo-preview">
                <img :src="newMealItem.photo" alt="Aperçu" class="preview-image" />
                <button @click="removePhoto" class="close-btn remove-photo-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              Description du repas
            </label>
            <input
              type="text"
              v-model="newMealItem.description"
              class="form-input"
              placeholder="Salade césar, pain complet, thé vert..."
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              Qualité nutritionnelle
            </label>
            <div class="quality-selector grid grid-2">
              <button
                v-for="quality in qualityOptions"
                :key="quality.value"
                class="option-btn quality-btn"
                :class="{ 'active': newMealItem.quality === quality.value, [quality.value]: true }"
                @click="newMealItem.quality = quality.value"
              >
                <span class="option-emoji">{{ quality.icon }}</span>
                <span class="option-label">{{ quality.label }}</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Notes additionnelles (optionnel)
            </label>
            <textarea
              v-model="newMealItem.notes"
              class="form-textarea"
              placeholder="Restaurant, occasion spéciale, ressentis..."
              rows="3"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button @click="closeMealForm" class="btn-secondary">Annuler</button>
            <button
              @click="addMealItem"
              class="btn-primary"
              :disabled="!canSaveMeal"
            >
              Ajouter le repas
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showPhotoViewer" @click="closePhotoViewer">
      <div class="photo-viewer-modal" @click.stop>
        <button @click="closePhotoViewer" class="close-btn close-viewer-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <img :src="currentPhoto" alt="Photo du repas" class="full-photo" />
      </div>
    </div>

    <div class="card-gradient mb-5" v-if="hasMeals">
      <h3 class="text-center mb-4">Résumé de la journée</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🍽️</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalMeals }}</div>
            <div class="stat-label">Repas enregistrés</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📷</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalPhotos }}</div>
            <div class="stat-label">Photos prises</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div class="stat-content">
            <div class="stat-value">{{ averageQuality }}</div>
            <div class="stat-label">Qualité moyenne</div>
          </div>
        </div>
      </div>
    </div>

    <div class="encouragement" v-else>
      <div class="encouragement-icon">🍎</div>
      <h3 class="encouragement-title">Commencez votre suivi alimentaire</h3>
      <p class="encouragement-text">
        Prenez des photos de vos repas ou ajoutez des descriptions pour suivre votre alimentation quotidienne.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  date: { type: String, required: true }
})

const emit = defineEmits(['update'])

const alimentationData = ref({
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: []
})

const showMealForm = ref(false)
const showPhotoViewer = ref(false)
const currentMealType = ref('')
const currentPhoto = ref('')

const newMealItem = ref({
  description: '',
  photo: null,
  quality: '',
  notes: '',
  timestamp: ''
})

const mealTypes = [
  { id: 'breakfast', name: 'Petit-déjeuner', icon: '🌅', time: '7h00 - 10h00' },
  { id: 'lunch', name: 'Déjeuner', icon: '☀️', time: '12h00 - 14h00' },
  { id: 'dinner', name: 'Dîner', icon: '🌙', time: '19h00 - 21h00' },
  { id: 'snacks', name: 'Collations', icon: '🍪', time: 'Toute la journée' }
]

const qualityOptions = [
  { value: 'excellent', label: 'Excellent', icon: '🥗' },
  { value: 'good', label: 'Bon', icon: '🍎' },
  { value: 'average', label: 'Moyen', icon: '🍞' },
  { value: 'poor', label: 'Pauvre', icon: '🍟' }
]

// Computed
const hasMeals = computed(() => {
  return Object.values(alimentationData.value).some(meals => meals.length > 0)
})

const totalMeals = computed(() => {
  return Object.values(alimentationData.value).reduce((total, meals) => total + meals.length, 0)
})

const totalPhotos = computed(() => {
  return Object.values(alimentationData.value)
    .flat()
    .filter(meal => meal.photo).length
})

const averageQuality = computed(() => {
  const allMeals = Object.values(alimentationData.value).flat()
  if (allMeals.length === 0) return '--'
  
  const qualityValues = { excellent: 4, good: 3, average: 2, poor: 1 }
  const totalQuality = allMeals.reduce((sum, meal) => {
    return sum + (qualityValues[meal.quality] || 0)
  }, 0)
  
  const average = totalQuality / allMeals.length
  
  if (average >= 3.5) return 'Excellent'
  if (average >= 2.5) return 'Bon'
  if (average >= 1.5) return 'Moyen'
  return 'À améliorer'
})

const canSaveMeal = computed(() => {
  return newMealItem.value.description.trim() && newMealItem.value.quality
})

const isDataComplete = computed(() => hasMeals.value)

// Methods
const getMealData = (mealType) => alimentationData.value[mealType] || []

const getCurrentMealName = () => {
  const meal = mealTypes.find(m => m.id === currentMealType.value)
  return meal ? meal.name.toLowerCase() : ''
}

const openMealForm = (mealType) => {
  currentMealType.value = mealType
  newMealItem.value = {
    description: '',
    photo: null,
    quality: '',
    notes: '',
    timestamp: new Date().toISOString()
  }
  showMealForm.value = true
}

const closeMealForm = () => {
  showMealForm.value = false
  currentMealType.value = ''
}

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newMealItem.value.photo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  newMealItem.value.photo = null
}

const addMealItem = () => {
  if (!canSaveMeal.value) return
  
  const mealItem = {
    description: newMealItem.value.description.trim(),
    photo: newMealItem.value.photo,
    quality: newMealItem.value.quality,
    notes: newMealItem.value.notes.trim(),
    timestamp: new Date().toISOString()
  }
  
  alimentationData.value[currentMealType.value].push(mealItem)
  closeMealForm()
  updateData()
}

const removeMealItem = (mealType, index) => {
  alimentationData.value[mealType].splice(index, 1)
  updateData()
}

const viewPhoto = (photo) => {
  currentPhoto.value = photo
  showPhotoViewer.value = true
}

const closePhotoViewer = () => {
  showPhotoViewer.value = false
  currentPhoto.value = ''
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getQualityIcon = (quality) => {
  const option = qualityOptions.find(q => q.value === quality)
  return option ? option.icon : '🍽️'
}

const getQualityLabel = (quality) => {
  const option = qualityOptions.find(q => q.value === quality)
  return option ? option.label : 'Non évalué'
}

const updateData = () => {
  saveData()
  emit('update', 'alimentation', isDataComplete.value)
}

const saveData = () => {
  const key = `alimentation-${props.date}`
  localStorage.setItem(key, JSON.stringify(alimentationData.value))
}

const loadData = () => {
  const key = `alimentation-${props.date}`
  const savedData = localStorage.getItem(key)
  if (savedData) {
    alimentationData.value = JSON.parse(savedData)
  } else {
    alimentationData.value = { breakfast: [], lunch: [], dinner: [], snacks: [] }
  }
  emit('update', 'alimentation', isDataComplete.value)
}

watch(() => props.date, loadData)
onMounted(loadData)
</script>

<style scoped>
.meal-section {
  margin-bottom: 2rem;
  overflow: hidden;
}

.meal-section.has-content {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-md);
}

.meal-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.meal-icon {
  font-size: 2rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.meal-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
}

.meal-time {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.add-meal-btn {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.add-meal-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-accent);
}

.meal-items {
  padding: 1.5rem;
}

.meal-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  position: relative;
  border: 1px solid rgba(138, 43, 226, 0.1);
  transition: all var(--transition-fast);
}

.meal-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.item-photo {
  position: relative;
  flex-shrink: 0;
}

.food-photo {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 2px solid rgba(138, 43, 226, 0.2);
}

.view-photo-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.item-photo:hover .view-photo-btn {
  opacity: 1;
}

.item-content {
  flex: 1;
}

.item-description {
  font-size: 1.125rem;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.item-metadata {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.item-time {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.item-quality {
  font-weight: var(--font-weight-medium);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
}

.item-quality.excellent { background: rgba(16, 185, 129, 0.1); color: #059669; }
.item-quality.good { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
.item-quality.average { background: rgba(251, 191, 36, 0.1); color: #d97706; }
.item-quality.poor { background: rgba(239, 68, 68, 0.1); color: #dc2626; }

.item-notes {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
  line-height: 1.5;
}

.empty-meal {
  padding: 3rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.photo-upload-area {
  border: 2px dashed rgba(138, 43, 226, 0.3);
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.photo-upload-area:hover {
  border-color: var(--accent-primary);
  background: rgba(138, 43, 226, 0.05);
}

.photo-upload-area.has-photo {
  border-style: solid;
  padding: 1rem;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
}

.upload-text {
  font-size: 1.125rem;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.photo-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.remove-photo-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(239, 68, 68, 0.9) !important;
  color: white !important;
}

.photo-viewer-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.close-viewer-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  width: 48px;
  height: 48px;
  z-index: 1001;
}

.full-photo {
  max-width: 100%;
  max-height: 100%;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 1px solid rgba(138, 43, 226, 0.1);
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .meal-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .food-photo {
    width: 100%;
    height: 200px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>