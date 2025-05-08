<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import '/src/stylesheets/input.css'


//const text = ref<string>("");
const props = defineProps<{text: string}>();
const isActive = defineModel()
const emit = defineEmits<(e: 'yes') => void>();

function toggleOverlay(){
  if(isActive.value === true){
    console.log("if true")
    isActive.value = false
  }else{
    console.log("if false")
    isActive.value = true
  }
  //console.log("isActive: " + isActive.value)
}
function yes(){
  emit('yes')
  console.log("yes")
  toggleOverlay()
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
  <div v-if="isActive" id="overlay">
    <div id="content">
      <h6>{{ props.text }}</h6>
      <button @click="yes" id="btn-small">Yes</button>
      <button @click="no" id="btn-small">No</button>
    </div>
  </div>
</template>

<style scoped>
#overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 2;
  cursor: pointer;
}

#content{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  -ms-transform: translate(-50%,-50%);
  padding: 5%;
  border-radius: 20px;
  background-color: var(--background);
  color: var(--text);
  word-wrap: break-word;
}
</style>