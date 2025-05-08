<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

import '/src/stylesheets/nav.css';
import { watchEffect } from 'vue';

const router = useRouter();
const route = useRoute();

function navigateTo(path: string): void {
  router.push(path);
}

</script>

<template>
  <div class = "nav-limiter"></div>
    <div class="mobile-navigation-bar">
  <div 
    class="icon-container" 
    @click="navigateTo('/events')" 
    :class="{ active: route.name === 'events' }"
  >
    <img src="../temporary-images/home.png" />
    <div class="ani_square"></div>
  </div>

  <div 
    class="icon-container" 
    @click="navigateTo('/setlists')" 
    :class="{ active: route.name === 'setlists' }"
  >
    <img class="setlists" src="../temporary-images/list.png" />
    <div class="ani_square"></div>
  </div>

  <div 
    class="icon-container" 
    @click="navigateTo('/songs')" 
    :class="{ active: route.name === 'songs' }"
  >
    <img class="tracks" src="../temporary-images/music.png" />
    <div class="ani_square"></div>
  </div>
</div>

</template>
