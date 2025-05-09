
<script setup lang="ts">
import VueBottomSheet from "@webzlodimir/vue-bottom-sheet";
import "@webzlodimir/vue-bottom-sheet/dist/style.css";
import { ref, defineExpose } from "vue";

const myBottomSheet = ref<InstanceType<typeof VueBottomSheet>>();

const open = () => myBottomSheet.value?.open();
const close = () => myBottomSheet.value?.close();

defineExpose({ open, close });
</script>

<template>
  <vue-bottom-sheet ref="myBottomSheet">
    <h1>Lorem Ipsum</h1>
    <p>Some content here</p>
    <p>Some content here</p>
    <p>Some content here</p>
    <p>Some content here</p>
    <p>Some content here</p>
    <p>Some content here</p>
    <p>Some content here</p>
    <p>Some content here</p>
    <p>Some content here</p>
    <p>Some content here</p>
    <p>Some content here</p>
  </vue-bottom-sheet>
</template>

<style scoped>
  h1, p{
    color: var(--text);
  }
</style>
