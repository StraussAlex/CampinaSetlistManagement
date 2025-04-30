<script setup lang="ts">
import { ref, watch } from 'vue';

const currentSearch = ref<string>("");

const emit = defineEmits<(e: 'search-change', value: string) => void>()

watch(currentSearch, (newVal) => {
  emit('search-change', newVal);
});

</script>
<template>
    <div class="search-bar">
        <label for="search-input">Search
            <input name="search-input" type="text" v-model="currentSearch">
        </label>
    </div>
</template>

<style scoped>

    .search-bar {
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: center;
        gap: 10px;

        padding: 20px;
        background-color: #1e1e1e;
    }

</style>