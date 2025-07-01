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
import '../../assets/journal/sleep.css'

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
  return (progress * 360 - 90) * Math.PI / 180
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
  const key = `journal-${userEmailOrGuest()}-${props.date}`
  const journalData = JSON.parse(localStorage.getItem(key)) || {}

  journalData.completions = journalData.completions || {}
  journalData.completions.sommeil = {
    sleepMinutesTotal: sleepMinutesTotal.value,
    wakeFeeling: sleepData.value.wakeFeeling
  }

  journalData.sommeil = {
    sleepMinutesTotal: sleepMinutesTotal.value,
    sleepHours: sleepHours.value,
    sleepMinutes: sleepMinutes.value,
    wakeFeeling: sleepData.value.wakeFeeling
  }

  journalData.lastUpdated = new Date().toISOString()

  localStorage.setItem(key, JSON.stringify(journalData))

  emit('update', 'sommeil', isDataComplete.value, {
    sleepMinutesTotal: sleepMinutesTotal.value,
    wakeFeeling: sleepData.value.wakeFeeling
  })
}

const loadData = () => {
  const key = `journal-${userEmailOrGuest()}-${props.date}`
  const savedData = localStorage.getItem(key)
  if (savedData) {
    const data = JSON.parse(savedData)
    if (data.sommeil) {
      sleepMinutesTotal.value = data.sommeil.sleepMinutesTotal || 480
      sleepData.value.wakeFeeling = data.sommeil.wakeFeeling || null
    }
  } else {
    sleepMinutesTotal.value = 480
    sleepData.value.wakeFeeling = null
  }
  emit('update', 'sommeil', isDataComplete.value, {
    sleepMinutesTotal: sleepMinutesTotal.value,
    wakeFeeling: sleepData.value.wakeFeeling
  })
}

function userEmailOrGuest() {
  const user = JSON.parse(localStorage.getItem('user')) || null
  return user?.email || 'guest'
}

watch(() => props.date, loadData)
onMounted(loadData)
</script>