<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import '/src/stylesheets/input.css'


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
#background {
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
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  -ms-transform: translate(-50%,-50%);
  padding: 5%;
  border-radius: 20px;
  background-color: var(--background);
  color: var(--text);
  word-wrap: break-word;
  z-index: 3;
}
</style>