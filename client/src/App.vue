<script setup lang="ts">
import './style.css';
import { ref, onMounted } from 'vue'
import MobileNavBar from "./components/elements/Mobile-Navigation-Bar.vue";
import '/src/stylesheets/input.css';
import {useRoute} from "vue-router";
import MobileHeader from "./components/elements/Mobile-Header.vue";
import DesktopHeader from "./components/elements/Desktop-Header.vue";
const route = useRoute();
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

function displayNav():boolean {
  switch (route.name) {
    case "login":
      return false;
    case "landing-page":
      return false;
    case "not-found-page":
      return false;
  }
  return true;
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
  <DesktopHeader></DesktopHeader>
  <router-view></router-view>

  <label class="switch themeSwitch">
    <input @click="toggleTheme" type="checkbox">
    <span class="slider round"></span>
  </label>
  <MobileNavBar v-if="displayNav()"></MobileNavBar>
</template>

<style scoped>

</style>
