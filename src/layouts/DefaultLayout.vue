<template>
  <div>
    <header>Streamline</header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useHead } from '@unhead/vue';

useHead({titleTemplate: (t?: string) => (t ? `${t} • Streamline Flow` : 'Streamline Flow')})
</script>
