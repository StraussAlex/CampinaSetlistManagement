<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api'
import Event from '../models/Event';
import MobileHeader from "./elements/Mobile-Header.vue";
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
  <div class="app">
    <div class="header-wrapper">
      <mobile-header>
        <button @click="redirectToLogin" class="btn-small">Log In</button>
      </mobile-header>
    </div>
    <div class = "shadow-wrapper">
      <div class="content-wrapper">
        <h1 class="section-heading">Campina Band</h1>
        <div class="next-event-wrapper" v-if="upcomingEvent !== null && errorMsg.length <= 0">
          <h3>Our next gig</h3>
          <div><h5>What:</h5> {{ upcomingEvent.name }}</div>
          <div><h5>Where:</h5> {{ upcomingEvent.location }}</div>
          <div><h5>When:</h5> {{ upcomingEvent.getFullDate }}</div>
        </div>
        <div v-else>
          <h3>Next gig coming soon!</h3>
        </div>
        <p v-if="errorMsg.length > 0">{{ errorMsg }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>




.section-heading{
  background: none;
}
h1.section-heading {
  font-size: 4rem;
}
div > h5 {
  margin: 0;
}
.next-event-wrapper > div {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  align-self: center;
  width: 100%;
  padding: 5px 20px;
}
@media screen and (max-width: 600px) {
  h1.section-heading {
    font-size: 3rem;
    margin-top: -50px;
  }
}
.next-event-wrapper {
  border-radius: 12px;
  border-top: 5px solid var(--primary-lighter);
  border-bottom: 5px solid var(--primary-lighter);
  width: 30vw;
  padding: 12px 0;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
}
@media screen and (max-width: 900px) {
  .next-event-wrapper {
    width: 90vw;
  }
}
.content-wrapper {
  height: calc(100vh - 130px);
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.app {
  background-image: url("../assets/Icons/landingPageBackground.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: left;
  background-position-y: bottom;
  overflow-x: hidden;
  position: fixed;
  height: 100vh; 
  width: 100%;
}

.shadow-wrapper{
  background: linear-gradient(
  180deg,
  color-mix(in srgb, var(--background) 100%, transparent) 0%,
  color-mix(in srgb, var(--background) 98%, transparent) 10%,
  color-mix(in srgb, var(--background) 96%, transparent) 20%,
  color-mix(in srgb, var(--background) 93%, transparent) 30%,
  color-mix(in srgb, var(--background) 88%, transparent) 40%,
  color-mix(in srgb, var(--background) 80%, transparent) 50%,
  color-mix(in srgb, var(--background) 70%, transparent) 60%,
  color-mix(in srgb, var(--background) 60%, transparent) 70%,
  color-mix(in srgb, var(--background) 40%, transparent) 80%,
  color-mix(in srgb, var(--background) 20%, transparent) 90%,
  color-mix(in srgb, var(--background) 0%, transparent) 100%
);
  padding-bottom: 5vh;
}

.h1,h2,p{
  text-shadow: var(--background) 2px 2px 20px;
}

.header-wrapper{
  background-color: var(--background);
}
</style>
