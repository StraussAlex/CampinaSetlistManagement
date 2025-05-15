<script setup lang="ts">
import './App.css';
import { ref, onMounted } from 'vue'
import MobileNavBar from "./components/elements/Mobile-Navigation-Bar.vue";
import '/src/stylesheets/input.css';

const theme = ref<'light' | 'dark'>('light')

const setTheme = (value: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem('theme', value)
  theme.value = value
}

const toggleTheme = () => {
  const newTheme = theme.value === 'light' ? 'dark' : 'light'
  setTheme(newTheme)
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'light' || saved === 'dark') {
    setTheme(saved)
  } else {
    setTheme('light')
  }
})
</script>

<template>

  <!-- <p>use route / to see event overview</p>
  <p>use route /songs to see song overview</p>
  <p>use route /setlists to see setlist overview</p>
  <p>use route /create-song to see add song page</p>
  <p>use route /songs/:id to see song details</p>
  <p>use route /setlists/:id to see setlist details</p> -->
  <router-view></router-view>
  <label class="switch">
    <input @click="toggleTheme" type="checkbox">
    <span class="slider round"></span>
  </label>
  <MobileNavBar></MobileNavBar>
</template>

<style scoped>
  .switch{
    position: fixed;
    left: 10px;
    bottom: 10%;
  }
</style>
