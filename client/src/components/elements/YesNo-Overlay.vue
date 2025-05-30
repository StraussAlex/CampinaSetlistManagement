<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import '/src/stylesheets/input.css'
import '/src/stylesheets/overlay.css';

//const text = ref<string>("");
const props = defineProps<{text: string}>();
const isActive = defineModel()
const emit = defineEmits<(e: 'yes') => void>();

function toggleOverlay(){
  isActive.value = !isActive.value
}
function yes(){
  emit('yes')
  toggleOverlay()
}
function no(){
  toggleOverlay()
}

onMounted(()=>{
  //text.value = props.text
})
</script>

<template>
  <div v-if="isActive">
    <div id="content">
      <h6>{{ props.text }}</h6>
      <button @click="yes" id="btn-small">Yes</button>
      <button @click="no" id="btn-small">No</button>
    </div>
    <div @click="no" id="background"></div>
  </div>
</template>

<style scoped>

</style>