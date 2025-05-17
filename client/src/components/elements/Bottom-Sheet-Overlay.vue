<template>
  <vue-bottom-sheet ref="myBottomSheet">
    <h1>Lorem Ipsum</h1>
    <h2>What is Lorem Ipsum?</h2>
    <p>
      <strong>Lorem Ipsum</strong> is simply dummy text
    </p>
    <p>
      <strong>Lorem Ipsum</strong> is simply dummy text
    </p>
    <p>
      <strong>Lorem Ipsum</strong> is simply dummy text
    </p>
    <p>
      <strong>Lorem Ipsum</strong> is simply dummy text
    </p>
    <p>
      <strong>Lorem Ipsum</strong> is simply dummy text
    </p>
  </vue-bottom-sheet>
</template>

<script setup>
import VueBottomSheet from "@webzlodimir/vue-bottom-sheet";
import  "@webzlodimir/vue-bottom-sheet/dist/style.css";
import { ref } from "vue";

const myBottomSheet = ref(null)

const open = () => {
  myBottomSheet.value.open();
}

const close = () => {
  myBottomSheet.value.close();
}

defineExpose({
  open
})
</script>