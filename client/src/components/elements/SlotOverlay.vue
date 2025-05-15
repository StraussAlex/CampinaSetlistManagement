<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import '/src/stylesheets/input.css'
import '/src/stylesheets/overlay.css';

//const text = ref<string>("");

const isActive = defineModel()


function toggleOverlay(){
  isActive.value = !isActive.value
}
function no(){
  console.log("no")
  toggleOverlay()
}

onMounted(()=>{
  //text.value = props.text

  watch(isActive, (newVal, oldVal) => {
    if (newVal !== oldVal) {
      console.log("watcher: " + newVal)
    }})
})
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