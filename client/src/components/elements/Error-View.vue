<script setup lang="ts">
interface Props {
  errors: string[]
}
const props = defineProps<Props>();   

</script>
<template>

    <div>
        <ul v-for="error in props.errors">
            <li>{{ error }}</li>
        </ul>
    </div>
    
</template>

<style scoped>

    ul {
        list-style: none;
        padding: 0;
        margin: 10px;
    }
    li {
        padding: 0;
        color: var(--accent);
    }

</style>