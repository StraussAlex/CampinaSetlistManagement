<script setup>
    import { useRouter } from 'vue-router';

    const router = useRouter();

    function navigateTo(path) {
        router.push(path);
    }
</script>
<template>
    <div class="navigation-bar-bottom">
        <button @click="navigateTo('/events')">Events</button>
        <button @click="navigateTo('/setlists')">Setlists</button>
        <button @click="navigateTo('/songs')">Songs</button>
        <!-- only show this button if logged in as admin -->
        <button @click="navigateTo('/manage-users')">Users</button> 
    </div>
</template>

<style scoped>

    .navigation-bar-bottom {
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: center;
        gap: 10px;

        width: 100%;
        position: fixed;
        bottom: 0;
        left: 0;

        padding: 20px;
        background-color: #1e1e1e;
    }

</style>