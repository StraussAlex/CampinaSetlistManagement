<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function viewSetlists(): void {
    router.push("/setlists");
}
function viewSongs(): void {
    router.push("/songs");
}

function createEvent(): void {
    router.push("/create-event");
}
</script>

<template>
    <p>Event list here</p>
    <p>This page could be the public landing page where people can see events?</p>
    <p>Band members could also log in here to maybe unlock more actions etc..?</p>
    <button>Log in</button>

    <button @click="viewSetlists">Setlists</button>
    <button @click="viewSongs">Songs</button>
    <button @click="createEvent">Create Event</button>
</template>

<style scoped>

</style>