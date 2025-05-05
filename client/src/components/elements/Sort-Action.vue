<script setup lang="ts">
import { ref } from 'vue';
import 'stylesheets/search.css'

export type order = 'asc' | 'desc';
interface Props {
  sortAscLabel: string,
  sortDescLabel: string
}

const props = defineProps<Props>();

const currentSort = ref<order>('asc');

const emit = defineEmits<(e: 'sort-change', value: order) => void>();

function changeSorting(): void {
    currentSort.value = currentSort.value === 'asc' ? 'desc' : 'asc';
    emit('sort-change', currentSort.value);
}

</script>
<template>
    <button @click="changeSorting"> {{ currentSort === 'asc' ? sortAscLabel : sortDescLabel }}</button>
</template>

<style scoped>

</style>