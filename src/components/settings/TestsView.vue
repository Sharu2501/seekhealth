<template>
  <div class="settings-view">
    <h1 class="settings-title">Tests disponibles</h1>

    <!-- Tests -->
    <section class="test-section">
      <h2>Tests liés au corps</h2>
      <ul>
        <li>
          <RouterLink to="/settings/cancer" class="btn-secondary">
            Test de dépistage du cancer
          </RouterLink>
        </li>
        <li v-if="user?.gender === 'femme' || user?.gender === 'Femme'">
          <button class="btn-secondary" @click="startTest('regles')">Test sur les règles</button>
        </li>
      </ul>
    </section>

    <!-- Tests dyslexie -->
    <section class="test-section">
      <h2>Tests de dyslexie</h2>
      <ul>
        <li>
          <button class="btn-secondary" @click="startTest('dyslexie-basic')">Test basique de dyslexie</button>
        </li>
        <li>
          <button class="btn-secondary" @click="startTest('dyslexie-avance')">Test avancé de dyslexie</button>
        </li>
      </ul>
    </section>

    <!-- Tests handicaps -->
    <section class="test-section">
      <h2>Tests pour handicaps</h2>
      <ul>
        <li>
          <button class="btn-secondary" @click="startTest('non-voyant')">Test handicap non voyant</button>
        </li>
        <li>
          <button class="btn-secondary" @click="startTest('handicap-auditif')">Test handicap auditif</button>
        </li>
        <li>
          <button class="btn-secondary" @click="startTest('handicap-vitesse')">Test de vitesse motrice</button>
        </li>
      </ul>
    </section>

  </div>
</template>

<script setup>
defineProps({
  user: Object
})

const startTest = (testName) => {
  alert(`Lancement du test : ${testName}`)
}
</script>

<style scoped>
.settings-view {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  font-family: var(--font-family), serif;
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

.test-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.test-section h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.test-section ul {
  list-style: none;
  padding: 0;
}

.test-section li {
  margin-bottom: 1rem;
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
</style>