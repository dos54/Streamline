<template>
  <div class="logo-wrapper">
    <RouterLink to="/" class="logo-link"><h1 class="logo-text">Streamline Flow</h1></RouterLink>
  </div>
</template>

<style scoped>
.logo-wrapper {
  /* Positioning */
  position: fixed;
  top: 8px;
  right: 8px;

  /* Sizing */
  padding: 0.5rem 0.75rem;

  background-color: var(--overlay-bg);
  border-radius: var(--overlay-border-radius);
  border: var(--overlay-border-settings);
}

.logo-text {
  /* Sizing */
  padding: 0;
  margin: 0;

  /* Styling */
  font-weight: bold;
  color: black;

  /* Behavior */
  pointer-events: auto;
}

.logo-link {
  text-decoration: none;
}
</style>
