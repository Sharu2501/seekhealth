<template>
  <div class="section-container">
    <div class="section-header">
      <h2 class="section-title">
        <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        Suivi du Sommeil
      </h2>
      <p class="section-description">
        Ajustez la jauge pour indiquer votre durée de sommeil
      </p>
    </div>

    <div class="sleep-gauge-container">
      <div class="sleep-gauge">
        <svg class="gauge-svg" width="300" height="300">
          <circle
            class="gauge-background"
            cx="150"
            cy="150"
            r="120"
            stroke="rgba(138, 43, 226, 0.1)"
            stroke-width="20"
            fill="none"
          />
          
          <circle
            class="gauge-progress"
            cx="150"
            cy="150"
            r="120"
            :stroke="gaugeColor"
            stroke-width="20"
            fill="none"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            transform="rotate(-90 150 150)"
          />
          
          <circle
            class="gauge-indicator"
            :cx="indicatorX"
            :cy="indicatorY"
            r="12"
            :fill="gaugeColor"
            stroke="white"
            stroke-width="3"
          />
          
          <g class="gauge-marks">
            <line v-for="hour in 12" :key="hour"
              :x1="150 + Math.cos((hour * 30 - 90) * Math.PI / 180) * 100"
              :y1="150 + Math.sin((hour * 30 - 90) * Math.PI / 180) * 100"
              :x2="150 + Math.cos((hour * 30 - 90) * Math.PI / 180) * 110"
              :y2="150 + Math.sin((hour * 30 - 90) * Math.PI / 180) * 110"
              stroke="rgba(138, 43, 226, 0.3)"
              stroke-width="2"
            />
          </g>
          
          <g class="gauge-labels">
            <text v-for="hour in 12" :key="hour"
              :x="150 + Math.cos((hour * 30 - 90) * Math.PI / 180) * 85"
              :y="150 + Math.sin((hour * 30 - 90) * Math.PI / 180) * 85"
              text-anchor="middle"
              dominant-baseline="middle"
              class="gauge-label"
            >
              {{ hour }}h
            </text>
          </g>
        </svg>
        
        <div class="gauge-center">
          <div class="sleep-duration">{{ sleepHours }}h{{ sleepMinutes.toString().padStart(2, '0') }}</div>
          <div class="sleep-label">de sommeil</div>
        </div>
        
        <div 
          class="gauge-interactive"
          @mousedown="startDrag"
          @mousemove="onMouseMove"
          @mouseup="endDrag"
          @mouseleave="endDrag"
          @touchstart="startDrag"
          @touchmove="onTouchMove"
          @touchend="endDrag"
        ></div>
      </div>
      
      <div class="sleep-feedback">
        <div class="feedback-icon">{{ feedbackData.icon }}</div>
        <div class="feedback-message" :class="feedbackData.class">
          {{ feedbackData.message }}
        </div>
      </div>
      
      <div class="wake-feeling-section">
        <h3 class="wake-feeling-title">Comment vous sentez-vous au réveil ?</h3>
        <div class="wake-feeling-options">
          <button
            v-for="feeling in wakeFeelingOptions"
            :key="feeling.value"
            class="feeling-btn"
            :class="{ 'active': sleepData.wakeFeeling === feeling.value }"
            @click="selectWakeFeeling(feeling.value)"
            :title="feeling.label"
          >
            <div class="feeling-icon">{{ feeling.icon }}</div>
            <span class="feeling-label">{{ feeling.label }}</span>
          </button>
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

const sleepMinutesTotal = ref(480)
const sleepData = ref({
  wakeFeeling: null
})
const isDragging = ref(false)

const wakeFeelingOptions = [
  {
    value: 'normal',
    label: 'Normal',
    icon: '😊'
  },
  {
    value: 'leger',
    label: 'Léger',
    icon: '🌟'
  },
  {
    value: 'lourd',
    label: 'Lourd',
    icon: '😴'
  },
  {
    value: 'mal_tete',
    label: 'Mal de tête',
    icon: '🤕'
  },
  {
    value: 'fatigue',
    label: 'Fatigué',
    icon: '😪'
  },
  {
    value: 'energique',
    label: 'Énergique',
    icon: '⚡'
  }
]

const circumference = 2 * Math.PI * 120 
const maxSleepMinutes = 720 

const sleepHours = computed(() => Math.floor(sleepMinutesTotal.value / 60))
const sleepMinutes = computed(() => sleepMinutesTotal.value % 60)

const strokeDashoffset = computed(() => {
  const progress = sleepMinutesTotal.value / maxSleepMinutes
  return circumference - (progress * circumference)
})

const indicatorAngle = computed(() => {
  const progress = sleepMinutesTotal.value / maxSleepMinutes
  return (progress * 360 - 90) * Math.PI / 180 // -90 pour commencer en haut
})

const indicatorX = computed(() => 150 + Math.cos(indicatorAngle.value) * 120)
const indicatorY = computed(() => 150 + Math.sin(indicatorAngle.value) * 120)

const gaugeColor = computed(() => {
  const hours = sleepHours.value
  if (hours < 6) return '#ef4444' 
  if (hours < 7) return '#f59e0b' 
  if (hours >= 7 && hours <= 9) return '#10b981' 
  return '#6366f1' 
})

const feedbackData = computed(() => {
  const hours = sleepHours.value
  const minutes = sleepMinutes.value
  const totalStr = `${hours}h${minutes.toString().padStart(2, '0')}`
  
  if (hours < 5) {
    return {
      icon: '😴',
      message: `${totalStr} - Sommeil très insuffisant`,
      class: 'feedback-poor'
    }
  } else if (hours < 6) {
    return {
      icon: '😪',
      message: `${totalStr} - Sommeil insuffisant`,
      class: 'feedback-poor'
    }
  } else if (hours < 7) {
    return {
      icon: '😐',
      message: `${totalStr} - Sommeil acceptable`,
      class: 'feedback-fair'
    }
  } else if (hours >= 7 && hours <= 9) {
    return {
      icon: '😊',
      message: `${totalStr} - Excellent sommeil !`,
      class: 'feedback-good'
    }
  } else {
    return {
      icon: '😅',
      message: `${totalStr} - Beaucoup de sommeil`,
      class: 'feedback-much'
    }
  }
})

const isDataComplete = computed(() => {
  return sleepMinutesTotal.value > 0 && sleepData.value.wakeFeeling !== null
})

const startDrag = (event) => {
  isDragging.value = true
  updateFromEvent(event)
}

const endDrag = () => {
  isDragging.value = false
  updateData()
}

const onMouseMove = (event) => {
  if (isDragging.value) {
    updateFromEvent(event)
  }
}

const onTouchMove = (event) => {
  if (isDragging.value) {
    event.preventDefault()
    updateFromEvent(event.touches[0])
  }
}

const updateFromEvent = (event) => {
  const rect = event.target.closest('.sleep-gauge').getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const x = event.clientX - centerX
  const y = event.clientY - centerY
  
  let angle = Math.atan2(y, x) * 180 / Math.PI + 90
  if (angle < 0) angle += 360
  
  const progress = angle / 360
  sleepMinutesTotal.value = Math.round(progress * maxSleepMinutes)
}

const selectWakeFeeling = (feeling) => {
  sleepData.value.wakeFeeling = feeling
  updateData()
}

const updateData = () => {
  saveData()
  emit('update', 'sommeil', isDataComplete.value)
}

const saveData = () => {
  const key = `sommeil-${props.date}`
  const data = {
    sleepMinutesTotal: sleepMinutesTotal.value,
    sleepHours: sleepHours.value,
    sleepMinutes: sleepMinutes.value,
    wakeFeeling: sleepData.value.wakeFeeling
  }
  localStorage.setItem(key, JSON.stringify(data))
}

const loadData = () => {
  const key = `sommeil-${props.date}`
  const savedData = localStorage.getItem(key)
  if (savedData) {
    const data = JSON.parse(savedData)
    sleepMinutesTotal.value = data.sleepMinutesTotal || 480
    sleepData.value.wakeFeeling = data.wakeFeeling || null
  } else {
    sleepMinutesTotal.value = 480 
    sleepData.value.wakeFeeling = null
  }
  emit('update', 'sommeil', isDataComplete.value)
}

watch(() => props.date, loadData)
onMounted(loadData)
</script>

<style scoped>
.section-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.section-icon {
  width: 32px;
  height: 32px;
  color: var(--accent-primary);
}

.section-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* JAUGE CIRCULAIRE */
.sleep-gauge-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.sleep-gauge {
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-svg {
  position: absolute;
  top: 0;
  left: 0;
}

.gauge-progress {
  transition: stroke-dashoffset 0.3s ease, stroke 0.3s ease;
  filter: drop-shadow(0 0 8px currentColor);
}

.gauge-indicator {
  transition: all 0.2s ease;
  cursor: grab;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.gauge-indicator:hover {
  transform: scale(1.2);
}

.gauge-label {
  font-size: 12px;
  font-weight: var(--font-weight-medium);
  fill: var(--text-secondary);
}

.gauge-interactive {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: grab;
  border-radius: 50%;
}

.gauge-interactive:active {
  cursor: grabbing;
}

.gauge-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
}

.sleep-duration {
  font-size: 3rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sleep-label {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.sleep-feedback {
  text-align: center;
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(138, 43, 226, 0.1);
  max-width: 400px;
  width: 100%;
}

.feedback-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feedback-message {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold);
  transition: color 0.3s ease;
}

.feedback-message.feedback-poor {
  color: #ef4444;
}

.feedback-message.feedback-fair {
  color: #f59e0b;
}

.feedback-message.feedback-good {
  color: #10b981;
}

.feedback-message.feedback-much {
  color: #6366f1;
}

.wake-feeling-section {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.wake-feeling-title {
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.wake-feeling-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.feeling-btn {
  background: var(--bg-primary);
  border: 2px solid rgba(138, 43, 226, 0.2);
  border-radius: var(--radius-md);
  padding: 1.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
}

.feeling-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.1), transparent);
  transition: left 0.5s ease;
}

.feeling-btn:hover::before {
  left: 100%;
}

.feeling-btn:hover {
  border-color: var(--accent-primary);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(138, 43, 226, 0.2);
}

.feeling-btn.active {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-color: var(--accent-primary);
  color: white;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(138, 43, 226, 0.4);
}

.feeling-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.feeling-label {
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.feeling-btn.active .feeling-label {
  color: white;
}

@media (max-width: 768px) {
  .sleep-gauge {
    width: 250px;
    height: 250px;
  }
  
  .gauge-svg {
    width: 250px;
    height: 250px;
  }
  
  .sleep-duration {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .wake-feeling-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .feeling-btn {
    padding: 1.25rem 0.75rem;
  }
  
  .feeling-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .section-container {
    padding: 1rem;
  }
  
  .sleep-gauge {
    width: 200px;
    height: 200px;
  }
  
  .gauge-svg {
    width: 200px;
    height: 200px;
  }
  
  .sleep-duration {
    font-size: 2rem;
  }
  
  .wake-feeling-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .feeling-btn {
    padding: 1rem 0.5rem;
  }
  
  .feeling-icon {
    font-size: 1.75rem;
  }
  
  .feeling-label {
    font-size: 0.75rem;
  }
}
</style>