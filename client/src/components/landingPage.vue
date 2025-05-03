<script setup lang="ts">

import { useRouter } from 'vue-router';
const router = useRouter();

function redirectToLogin(): void {
  router.push('/login');
}

</script>

<template>
  
  <h1>Campina Band</h1>
  <p>Our next gig (Todo show next gig here)</p>

  <button @click="redirectToLogin">Log In</button>

</template>

<style scoped>

</style>
