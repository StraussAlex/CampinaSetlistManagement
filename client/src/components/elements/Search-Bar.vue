<script setup lang="ts">
import { ref, watch } from 'vue';
import '/src/stylesheets/search.css'

const currentSearch = ref<string>("");

const emit = defineEmits<(e: 'search-change', value: string) => void>()

watch(currentSearch, (newVal) => {
  emit('search-change', newVal);
});

</script>
<template>
    <label for="search-input">
        <input name="search-input" type="text" v-model="currentSearch" placeholder="Search 🔍">
    </label>
</template>

<style scoped>

    /* .search-bar {
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: center;
        gap: 10px;

        padding: 20px;
        background-color: #1e1e1e;
    } */

</style>