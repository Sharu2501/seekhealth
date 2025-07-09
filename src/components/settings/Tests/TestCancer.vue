<template>
  <div class="test-container">
    <h1>🩺 Test de dépistage du cancer</h1>
    <p>Ce test vous posera quelques questions relatives à vos antécédents médicaux.</p>

    <transition name="fade-slide">
      <div key="test-content">
        <form v-if="!testFinished" @submit.prevent="evaluateTest" novalidate>
          <fieldset>
            <legend>1. Antécédents médicaux</legend>
            <label>
              <span class="icon">👪</span>
              Avez-vous des antécédents familiaux de cancer ?
              <select v-model="form.familyHistory" required>
                <option disabled value="">Sélectionnez</option>
                <option>Oui</option>
                <option>Non</option>
                <option>Je ne sais pas</option>
              </select>
            </label>

            <label>
              <span class="icon">🎗️</span>
              Avez-vous déjà été diagnostiqué(e) avec un cancer ?
              <select v-model="form.personalHistory" required>
                <option disabled value="">Sélectionnez</option>
                <option>Oui</option>
                <option>Non</option>
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend>2. Habitudes de vie</legend>
            <label>
              <span class="icon">🚬</span>
              Fumez-vous actuellement ?
              <select v-model="form.smoker" required>
                <option disabled value="">Sélectionnez</option>
                <option>Oui</option>
                <option>Non</option>
                <option>Occasionnellement</option>
              </select>
            </label>

            <label>
              <span class="icon">🏃‍♂️</span>
              Faites-vous de l'exercice régulièrement ?
              <select v-model="form.exercise" required>
                <option disabled value="">Sélectionnez</option>
                <option>Oui</option>
                <option>Non</option>
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend>3. Symptômes récents</legend>
            <label>
              <span class="icon">⚖️</span>
              Avez-vous récemment ressenti une perte de poids inexpliquée ?
              <select v-model="form.weightLoss" required>
                <option disabled value="">Sélectionnez</option>
                <option>Oui</option>
                <option>Non</option>
              </select>
            </label>

            <label>
              <span class="icon">😴</span>
              Avez-vous eu une fatigue inhabituelle prolongée ?
              <select v-model="form.fatigue" required>
                <option disabled value="">Sélectionnez</option>
                <option>Oui</option>
                <option>Non</option>
              </select>
            </label>
          </fieldset>

          <button type="submit" :disabled="!isFormComplete">Terminer le test</button>
        </form>

        <div v-else class="result-section">
          <h2>📊 Résultat du test</h2>
          <p>{{ resultMessage }}</p>
          <button @click="goHome">Retour à l'accueil</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import '@/assets/tests.css'

const router = useRouter()

const form = ref({
  familyHistory: '',
  personalHistory: '',
  smoker: '',
  exercise: '',
  weightLoss: '',
  fatigue: ''
})

const isFormComplete = computed(() => {
  return Object.values(form.value).every(val => val !== '')
})

const testFinished = ref(false)
const resultMessage = ref('')

const evaluateTest = () => {
  let riskScore = 0

  if (form.value.familyHistory === 'Oui') riskScore += 2
  if (form.value.personalHistory === 'Oui') riskScore += 3
  if (form.value.smoker === 'Oui') riskScore += 2
  if (form.value.smoker === 'Occasionnellement') riskScore += 1
  if (form.value.exercise === 'Non') riskScore += 1
  if (form.value.weightLoss === 'Oui') riskScore += 2
  if (form.value.fatigue === 'Oui') riskScore += 1

  if (riskScore >= 6) {
    resultMessage.value = "Votre test indique un risque élevé. Il est recommandé de consulter un professionnel de santé."
  } else if (riskScore >= 3) {
    resultMessage.value = "Votre test indique un risque modéré. Restez attentif(ve) à votre santé et envisagez un suivi médical."
  } else {
    resultMessage.value = "Votre test ne montre pas de facteurs de risque importants. Continuez à surveiller votre santé régulièrement."
  }

  testFinished.value = true
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.test-container {
  padding: 1rem 2rem;
}

.test-container h1 {
  color: var(--text-primary);
  font-weight: var(--font-weight-bold);
}

.test-container p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.test-container form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1.5rem;
}

.test-container fieldset {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 1rem 1.5rem;
  background-color: var(--bg-secondary);
  box-shadow: var(--shadow-sm);
}

.test-container legend {
  font-weight: var(--font-weight-semibold);
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.test-container label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-direction: row;
  margin-bottom: 1rem;
  font-size: 1rem;
  color: var(--text-primary);
}

.test-container label .icon {
  font-size: 1.5rem;
  min-width: 1.5rem;
  text-align: center;
}

.test-container select {
  margin-left: auto;
  min-width: 150px;
  padding: 0.5rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.test-container select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.2);
}

.test-container button {
  margin-top: 1rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--accent-primary);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: background-color var(--transition-normal);
  box-shadow: var(--shadow-accent);
}

.test-container button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.test-container button:not(:disabled):hover {
  background-color: var(--accent-hover);
}

.result-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
  box-shadow: var(--shadow-md);
}

.result-section h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.result-section p {
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}
</style>