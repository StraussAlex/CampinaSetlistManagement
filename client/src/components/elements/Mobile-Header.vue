<script setup lang="ts">

</script>

<template>
  <header>
    <img src="../../assets/Logo.png" alt="Logo displaying a stylized version of the mos eisley cantina band alien from star wars"/>
    <slot></slot>
  </header>
</template>

<style scoped>
  header{
    height: 110px;
    padding: 20px;
    margin: 0 5vw;
    width: 90vw;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--primary);
  }
</style>