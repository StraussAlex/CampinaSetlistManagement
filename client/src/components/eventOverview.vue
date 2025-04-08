<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Event from '../models/Event';
import api from '../services/api';

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

const EVENTS_API = "events";
const events = ref<Event[]>([])

async function loadEvents(): Promise<void> {
    try{
        const response = await api.get(EVENTS_API);
        events.value = response.data;
    } catch(error) {
        console.log("An error in showing the events has appeared: " + error);
    }
}

async function deleteEvent(eventId: number): Promise<void>{
    try{
        await api.delete(`${EVENTS_API}/${eventId}`);
        events.value = events.value.filter(event => event._id !== eventId);
        
    } catch(error){
        console.log("An error in deleting the event has appeared: " + error)
    }
}

function confirmDelete(): void{
    // TODO: ask to confirm the deletion of an event after clicking "delete" button
}

onMounted(() => loadEvents());

</script>

<template>
    <h1>Events</h1>
    <ul v-if="events.length !== 0">
        <li v-for="event in events">{{ event.name }} | {{ event.day }} of {{ event.month }} | {{ event.place }} <button>Details</button><button @click="deleteEvent(event._id)">Delete</button></li>
    </ul>
    <p v-else>No events are created yet</p>
    <p>This page could be the public landing page where people can see events?</p>
    <p>Band members could also log in here to maybe unlock more actions etc..?</p>
    <button>Log in</button>

    <button @click="viewSetlists">Setlists</button>
    <button @click="viewSongs">Songs</button>
    <button @click="createEvent">Create Event</button>
</template>

<style scoped>

</style>