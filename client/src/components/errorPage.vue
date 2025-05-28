<script setup lang="ts">

import { useRouter } from 'vue-router';
import api from '../services/api';

import MobileHeader from "./elements/Mobile-Header.vue";

const router = useRouter();

function returnToStart(): void { 
  router.push("/events") 
};

</script>

<template>

  <MobileHeader></MobileHeader>
  <div id="container">
    <h1>404</h1>
    <p>This page does not exist</p>
    <button @click="returnToStart">Return to start</button>
  </div>

</template>

<style scoped>
  #container {
    width: 100vw;
    height: calc(100vh - 125px);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
</style>
