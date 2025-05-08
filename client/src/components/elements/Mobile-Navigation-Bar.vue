<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

import '/src/stylesheets/nav.css';

const router = useRouter();
const route = useRoute();

function navigateTo(path: string): void {
    setTimeout(() => {
      router.push(path);
    }, 300); 
}

</script>

<template>
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
