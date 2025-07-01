<template>
  <div class="settings-view">
    <h1 class="settings-title">Paramètres</h1>

    <section class="user-info-section">
      <h2>Informations utilisateur</h2>
      <p><strong>Nom :</strong> {{ user?.name || 'Inconnu' }}</p>
      <p><strong>Email :</strong> {{ user?.email || 'Non défini' }}</p>
    </section>

    <RouterLink to="/settings/history" class="btn-secondary">
      Voir l’historique complet
    </RouterLink>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const { user } = defineProps({ user: Object })

const selectedDate = ref(new Date().toISOString().split('T')[0])
const journalData = ref(null)

const formattedDate = computed(() => {
  const date = new Date(selectedDate.value)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const loadJournalHistory = () => {
  const key = `journal-${selectedDate.value}`
  const saved = localStorage.getItem(key)
  journalData.value = saved ? JSON.parse(saved) : null
}

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('fr-FR')
}

loadJournalHistory()
</script>

<style scoped>
.settings-view {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  font-family: var(--font-family),serif;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

.settings-title {
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.user-info-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.user-info-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.user-info-section p {
  margin: 0.5rem 0;
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: var(--font-weight-normal);
}

.btn-secondary {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.btn-secondary:hover {
  background-color: var(--accent-primary);
  color: white;
}

.btn-secondary:active {
  background: var(--accent-primary);
  color: white;
}

ul {
  list-style: none;
  padding: 0;
}
</style>