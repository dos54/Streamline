<template>
  <div class="links-wrapper">
    <ul class="list">
      <li>
        <a
          href="https://github.com/dos54/Streamline"
          target="_blank"
          rel="noopener"
          aria-label="GitHub (Opens in new tab)"
          class="link"
        >
          <img
            class="github-link-image"
            :src="base + 'images/icons/github/github-mark.svg'"
            alt=""
          />
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const base = import.meta.env.BASE_URL
</script>

<style scoped>
.links-wrapper {
  /* Positioning */
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
  left: 50%;
  transform: translateX(-50%);

  /* Sizing */
  width: max-content;

  /* Styling */
  background-color: var(--overlay-bg);
  border-radius: var(--overlay-border-radius);
  border: var(--overlay-border-settings);
}

.links-wrapper * {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.link {
  display: block;
  height: 100%;
  width: 100%;
}

.link:hover {
  background-color: var(--primary-hover);
}

.list {
  display: flex;
  flex-direction: row;

  text-decoration: none;
  list-style: none;
}

.list > li {
  margin: 0.25rem;
  height: 200%;
  pointer-events: auto;
}

.github-link-image {
  width: 64px;
}

@media (max-width: 480px) {
  .github-link-image {
    width: 40px;
  }
}
</style>
