<script setup lang="ts">

import '/src/stylesheets/input.css'
import '/src/stylesheets/overlay.css';

//const text = ref<string>("");

const isActive = defineModel()


function toggleOverlay(){
  isActive.value = !isActive.value
}
function no(){
  toggleOverlay()
}
</script>

<template>
  <div v-if="isActive">
    <div id="content">
      <slot/>
      <button @click="no" >Done</button>
    </div>
    <div @click="no" id="background"></div>
  </div>
</template>

<style scoped>

</style>