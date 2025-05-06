<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api'
import Event from '../models/Event';
const router = useRouter();

const EVENT_API = "events";

const errorMsg = ref<string>('');
const upcomingEvent = ref<Event|null>(null);

function redirectToLogin(): void {
  router.push('/login');
}

async function loadUpcomingEvent(): Promise<void> {
  try {
    const response = await api.get(`${EVENT_API}/upcoming-public`);
    if(response.data !== null) {
      upcomingEvent.value = new Event(response.data.name, response.data.location, response.data.date, response.data.setlistIds, response.data.isPublic, response.data.creationDate);
      errorMsg.value = "";
    }
  } catch(error) {
    console.error(error);
    upcomingEvent.value = null;
    errorMsg.value = "An error occurred fetching the next event";
  }

}

onMounted(async() => {
  await loadUpcomingEvent();
})

</script>

<template>
  
  <h1>Campina Band</h1>
  
  <div v-if="upcomingEvent !== null && errorMsg.length <= 0">
    <h2>Our next gig</h2>
    <p>What: {{ upcomingEvent.name }}</p>
    <p>Where: {{ upcomingEvent.location }}</p>
    <p>When: {{ upcomingEvent.getFullDate }}</p>
  </div>
  <div v-else>
    <p>It's quiet here - for now</p>
    <p>Check later to not miss upcoming events!</p>
  </div>
  <p v-if="errorMsg.length > 0">{{ errorMsg }}</p>

  <button @click="redirectToLogin">Log In</button>

</template>

<style scoped>

</style>
