<template>
  <div class="history-view">
    <h1 class="history-title">Historique du journal</h1>

    <button class="back-button" @click="goBack">← Retour</button>

    <div class="filters">
      <button :class="{active: filter==='7'}" @click="setFilter('7')">7 derniers jours</button>
      <button :class="{active: filter==='30'}" @click="setFilter('30')">30 derniers jours</button>
      <button :class="{active: filter==='all'}" @click="setFilter('all')">Tout</button>
      <button :class="{active: filter==='custom'}" @click="setFilter('custom')">Personnalisé</button>

      <div v-if="filter==='custom'" class="custom-range">
        <input type="date" v-model="customStart" @change="applyCustomRange" />
        <span>—</span>
        <input type="date" v-model="customEnd" @change="applyCustomRange" />
      </div>
    </div>

    <table class="history-table" v-if="filteredEntries.length">
      <thead>
      <tr>
        <th>Date</th>
        <th>Sommeil</th>
        <th>Humeur</th>
        <th>Activité</th>
        <th>Alimentation</th>
        <th>%</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="entry in filteredEntries" :key="entry.date">
        <td>{{ formatDate(entry.date) }}</td>

        <td>
            <span v-if="entry.completions.sommeil" class="tooltip" :data-tooltip="sleepTooltip(entry.sommeil)" aria-label="Complété">
  ✔️
</span>
          <span v-else aria-label="Non complété" style="color: #e53935; font-weight: bold;">
  ✘
</span>

        </td>

        <td>
            <span v-if="entry.completions.humeur" class="tooltip" :data-tooltip="humeurTooltip(entry.humeur)" aria-label="Complété">
  ✔️
</span>
          <span v-else>✘</span>

        </td>

        <td>
  <span v-if="entry.completions.activite && entry.activite?.nbActivites > 0" class="tooltip" :data-tooltip="activitiesTooltip(entry.activite)" aria-label="Complété">
    ✔️
  </span>
          <span v-else>✘</span>
        </td>

        <td>
            <span v-if="entry.completions.alimentation" class="tooltip" :data-tooltip="alimentationTooltip(entry.alimentation)" aria-label="Complété">
              ✔️
              <img v-if="entry.alimentation?.photo" :src="entry.alimentation.photo" alt="photo repas" class="thumbnail" />
            </span>
          <span v-else>✘</span>
        </td>

        <td>{{ computePercentage(entry.completions) }}%</td>
      </tr>
      </tbody>
    </table>

    <p v-else class="empty-message">Aucune donnée disponible pour la période sélectionnée.</p>

    <button
      v-if="filteredEntries.length"
      @click="exportCSV"
      class="export-button"
    >
      📄 Exporter au format CSV
    </button>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const { user } = defineProps({ user: Object })

const allEntries = ref([])
const filter = ref('7')
const customStart = ref('')
const customEnd = ref('')

const setFilter = (f) => {
  filter.value = f
  if (f !== 'custom') {
    customStart.value = ''
    customEnd.value = ''
  }
}

const loadHistory = () => {
  allEntries.value = []

  const prefix = user?.email ? `journal-${user.email}-` : `journal-guest-`

  Object.keys(localStorage)
    .filter(k => k.startsWith(prefix))
    .forEach(k => {
      try {
        const date = k.replace(prefix, '')
        const data = JSON.parse(localStorage.getItem(k))

        allEntries.value.push({
          date,
          completions: data?.completions || {},
          lastUpdated: data?.lastUpdated || null,
          sommeil: data?.sommeil || null,
          humeur: data?.humeur || null,
          activite: data?.activite || null,
          alimentation: data?.alimentation || null
        })

      } catch (e) {
        console.warn(`Erreur lors du chargement de ${k}`, e)
      }
    })

  allEntries.value.sort((a, b) => new Date(b.date) - new Date(a.date))
}

const dateInFilter = (dateStr) => {
  if (filter.value === 'all') return true
  const date = new Date(dateStr)
  const today = new Date()

  if (filter.value === '7') {
    const past = new Date()
    past.setDate(today.getDate() - 6)
    return date >= new Date(past.toISOString().split('T')[0]) && date <= today
  }

  if (filter.value === '30') {
    const past = new Date()
    past.setDate(today.getDate() - 29)
    return date >= new Date(past.toISOString().split('T')[0]) && date <= today
  }

  if (filter.value === 'custom' && customStart.value && customEnd.value) {
    const start = new Date(customStart.value)
    const end = new Date(customEnd.value)
    return date >= start && date <= end
  }

  return true
}

const filteredEntries = computed(() => allEntries.value.filter(e => dateInFilter(e.date)))

const formatDate = (d) => {
  const date = new Date(d)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const computePercentage = (c) => {
  const keys = ['sommeil', 'humeur', 'activite', 'alimentation']
  const total = keys.filter(k => c[k]).length
  return Math.round((total / keys.length) * 100)
}

const sleepTooltip = (sommeil) => {
  if (!sommeil) return 'Non renseigné'

  const hours = Math.floor(sommeil.sleepMinutesTotal / 60)
  const minutes = sommeil.sleepMinutesTotal % 60
  const wakeFeeling = sommeil.wakeFeeling

  return `
    Durée: ${hours}h${minutes.toString().padStart(2, '0')}
    Ressenti: ${wakeFeeling?.toString() || 'Non renseigné'}
    ${wakeFeeling?.icon || ''}
  `.trim()
}

const humeurTooltip = (humeur) => {
  if (!humeur) return 'Non renseigné'

  const main = humeur.mainMood || 'Inconnu'
  const intensity = humeur.intensity ? `Intensité : ${humeur.intensity}/10` : ''
  const emotions = (humeur.secondaryEmotions?.length)
    ? `Émotions : ${humeur.secondaryEmotions.join(', ')}`
    : ''
  const factors = (humeur.factors?.length)
    ? `Influences : ${humeur.factors.join(', ')}`
    : ''
  const notes = humeur.notes ? `📝 ${humeur.notes}` : ''

  return [ `Humeur : ${main}`, intensity, emotions, factors, notes ]
    .filter(Boolean)
    .join('\n')
}

const activitiesTooltip = (activite) => {
  if (!activite || activite.nbActivites == null) return "0 activité"
  return `${activite.nbActivites} activité(s) (${activite.nomsActivites})`
}
const alimentationTooltip = (completionsAlimentation) => {
  if (!completionsAlimentation || Object.keys(completionsAlimentation).length === 0) {
    return 'Non renseigné';
  }

  const mealLabels = {
    breakfast: 'Petit-déjeuner',
    lunch: 'Déjeuner',
    dinner: 'Dîner',
    snacks: 'Snacks'
  }

  const tooltipLines = Object.entries(mealLabels).map(([mealKey, label]) => {
    const items = completionsAlimentation[mealKey] || [];
    const descriptions = items.map(item => item.description).filter(Boolean);
    const itemList = descriptions.length > 0 ? descriptions.join(', ') : '—';
    return `${label} : ${itemList}`;
  })

  return tooltipLines.join('\n');
}

const applyCustomRange = () => {
}

const goBack = () => {
  window.history.back()
}

onMounted(loadHistory)

const exportCSV = () => {
  const userId = user.email || 'Guest'

  const headers = [
    'ID utilisateur',
    'Date',
    'Sommeil (durée)',
    'Sommeil (ressenti)',
    'Humeur principale',
    'Humeur intensité',
    'Humeur émotions',
    'Humeur facteurs',
    'Activités',
    'Repas pris',
    'Complétude %'
  ]

  const rows = filteredEntries.value.map(entry => {
    const date = formatDate(entry.date)

    // Sommeil
    const sleep = entry.sommeil
    const sleepDuration = sleep ? `${Math.floor(sleep.sleepMinutesTotal / 60)}h${(sleep.sleepMinutesTotal % 60).toString().padStart(2, '0')}` : '—'
    const sleepFeeling = sleep?.wakeFeeling?.label
      ? `${sleep.wakeFeeling.label}${sleep.wakeFeeling.icon ? ` (${sleep.wakeFeeling.icon})` : ''}`
      : '—'

    // Humeur
    const humeur = entry.humeur
    const mainMood = humeur?.mainMood || '—'
    const intensity = humeur?.intensity ? `${humeur.intensity}/10` : '—'
    const emotions = humeur?.secondaryEmotions?.join(', ') || '—'
    const factors = humeur?.factors?.join(', ') || '—'

    // Activités
    const activite = entry.activite
    const activiteStr = activite?.nbActivites
      ? `${activite.nbActivites} activité(s) (${activite.nomsActivites})`
      : '—'

    // Alimentation
    const alim = entry.alimentation
    const mealLabels = {
      breakfast: 'Petit-déjeuner',
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snacks: 'Snacks'
    }

    const repas = Object.entries(mealLabels).map(([key, label]) => {
      const items = alim?.[key] || []
      const desc = items.map(i => i.description).filter(Boolean).join(', ')
      return `${label}: ${desc || '—'}`
    }).join(' | ')

    const percent = computePercentage(entry.completions) + '%'

    return [
      userId,
      date,
      sleepDuration,
      sleepFeeling,
      mainMood,
      intensity,
      emotions,
      factors,
      activiteStr,
      repas,
      percent
    ].map(value => `"${value.replace(/"/g, '""')}"`).join(',')
  })

  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const dateStr = new Date().toISOString().split('T')[0]
  const emailSafe = (user?.email || 'invité').replace(/[^a-zA-Z0-9-_@.]/g, '_')
  link.download = `journal-${emailSafe}-${dateStr}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

</script>

<style scoped>
.history-view {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  font-family: var(--font-family), serif;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

.history-title {
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.filters button {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  user-select: none;
}

.filters button:hover {
  background-color: var(--accent-secondary);
  color: #fff;
  box-shadow: var(--shadow-accent);
  transform: translateY(-1px);
}

.filters button.active {
  background-color: var(--accent-primary);
  color: #fff;
  box-shadow: var(--shadow-accent);
  transform: translateY(-1px);
}

.custom-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.custom-range input[type="date"] {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  font-family: var(--font-family), serif;
  font-weight: var(--font-weight-normal);
  font-size: 0.9rem;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  cursor: pointer;
  outline-offset: 2px;
}

.custom-range input[type="date"]:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.15);
  outline: none;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--bg-secondary);
  font-family: var(--font-family), serif;
}

.history-table thead {
  background-color: var(--bg-tertiary);
}

.history-table th,
.history-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-light);
  text-align: center;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  font-size: 0.95rem;
  user-select: none;
}

.history-table tbody tr:hover {
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-md);
  transition: background-color var(--transition-fast);
}

.history-table tbody td {
  font-weight: var(--font-weight-normal);
}

.empty-message {
  margin-top: 2.5rem;
  font-style: italic;
  color: var(--text-muted);
  font-weight: var(--font-weight-normal);
  text-align: center;
}

.tooltip {
  position: relative;
  cursor: help;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 1.4rem;
  background: var(--bg-tertiary);
  color: var(--accent-primary);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  user-select: none;
  transition: background-color var(--transition-fast);
}

.tooltip:hover {
  background: var(--accent-secondary);
  color: white;
}

.tooltip::after {
  content: attr(data-tooltip);
  position: fixed; /* changer ici */
  top: 50%; /* centre vertical */
  left: 50%; /* centre horizontal */
  transform: translate(-50%, -50%);
  background: rgba(50, 50, 50, 0.9);
  color: #fff;
  padding: 0.6rem 0.8rem;
  font-size: 0.85rem;
  white-space: pre-line;
  border-radius: var(--radius-md);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease-in-out;
  z-index: 9999; /* très au-dessus */
  max-width: 90vw;
  width: max-content;
  min-width: 220px;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  word-wrap: break-word;
}

.tooltip:hover::after {
  opacity: 1;
}

.thumbnail {
  display: inline-block;
  max-width: 40px;
  max-height: 40px;
  margin-left: 0.5rem;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  vertical-align: middle;
}

td > span[aria-label="Non complété"] {
  color: #e53935;
  font-weight: var(--font-weight-bold);
  font-size: 1.3rem;
  user-select: none;
}

td > span[aria-label="Complété"] {
  color: var(--accent-primary);
  font-weight: var(--font-weight-bold);
  font-size: 1.3rem;
  user-select: none;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 1rem;
  padding: 0.4rem 1rem;
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  color: var(--accent-primary);
  background-color: transparent;
  border: 2px solid var(--accent-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s, color 0.2s;
}

.back-button:hover {
  background-color: var(--accent-primary);
  color: white;
}

.export-button {
  margin-top: 1.5rem;
  padding: 0.6rem 1.4rem;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  font-size: 1rem;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: background-color 0.2s, box-shadow 0.2s;
}

.export-button:hover {
  background-color: var(--accent-secondary);
  box-shadow: var(--shadow-accent);
}

</style>
