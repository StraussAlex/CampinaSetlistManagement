<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import '/src/stylesheets/search.css'

export type SortOption = {
  value: string,
  display: string
}
interface Props {
  sortOptions: SortOption[]
}

const props = defineProps<Props>();
const currentSortCriteria = ref<string>('');

const emit = defineEmits<(e: 'sort-change', value: string) => void>();

onMounted(() => {
  if (props.sortOptions.length > 0) {
    currentSortCriteria.value = props.sortOptions[0].value;
    emit('sort-change', currentSortCriteria.value); 
  }
});

watch(currentSortCriteria, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    emit('sort-change', newVal);
  }
});

</script>
<template>
    <select v-model="currentSortCriteria">
      <option v-for="s in props.sortOptions" :value="s.value">{{ s.display }}</option>
    </select>
</template>

<style scoped>

</style>