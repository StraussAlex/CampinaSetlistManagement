
<script setup lang="ts">
import VueBottomSheet from "@webzlodimir/vue-bottom-sheet";
import "@webzlodimir/vue-bottom-sheet/dist/style.css";
import { ref, defineExpose, onMounted, watchEffect } from "vue";

const myBottomSheet = ref<InstanceType<typeof VueBottomSheet>>();

const open = () => myBottomSheet.value?.open();
const close = () => myBottomSheet.value?.close();

onMounted(() => {
  const el = document.querySelector('.bottom-sheet__content');
  watchEffect(() => {
  if (el) {
    (el as HTMLElement).style.backgroundColor = 'var(--background)';
  }
  })
  

  const thumb = document.querySelector('.bottom-sheet__draggable-thumb');
  if( thumb) {
    (thumb as HTMLElement).style.width = "80px";
    (thumb as HTMLElement).style.height = "8px";
  }
});

defineExpose({ open, close });
</script>

<template>
  <vue-bottom-sheet ref="myBottomSheet">
    <h1>Lorem Ipsum</h1>
    <h2>What is Lorem Ipsum?</h2>
    <p>
      <strong>Lorem Ipsum</strong> is simply dummy text
    </p>
  </vue-bottom-sheet>
</template>

<style scoped>
  h1, p{
    color: var(--text);
  }
</style>
