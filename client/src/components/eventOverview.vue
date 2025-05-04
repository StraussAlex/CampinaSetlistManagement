<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter,useRoute } from 'vue-router';
import Event from '../models/Event';
import api from '../services/api';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';

const router = useRouter();
// const route = useRoute();

// const eventId = route.params._id; ???

function createEvent(): void {
    router.push("/create-event");
}
function viewEvent(eventId: any): void {
  router.push({ name: 'viewevent', params: { id: eventId } });
}


const EVENTS_API = "events";
const events = ref<Event[]>([])

async function loadEvents(): Promise<void> {
    try{
        const response = await api.get(EVENTS_API);
        events.value = response.data.map((e: any) => {
        const event = new Event(e.name, e.location, e.date, e.setlistIds);
        event._id = e._id;
        return event;
    });
        console.log(events);
    } catch(error) {
        console.log("An error in showing the events has appeared: " + error);
    }
}
//Delete in createEvent verschoben, nur angezeigt wenn edited wird
// async function deleteEvent(eventId: number): Promise<void>{
//     try{
        
//         events.value = events.value.filter(event => event._id !== eventId);
        
//     } catch(error){
//         console.log("An error in deleting the event has appeared: " + error)
//     }
// }

// function confirmDelete(): void{
//     // TODO: ask to confirm the deletion of an event after clicking "delete" button
// }

onMounted(() => loadEvents());

</script>

<template>
    <h1>Events</h1>
    <ul v-if="events.length !== 0">
        <li v-for="event in events">{{ event.name }} | {{ event.getFullDate }} 
            <button @click="viewEvent(event._id)">Details</button>
            <!-- <button @click="updateEvent(event._id)">Edit Event</button> -->
        </li>
    </ul>
    <p v-else>No events are created yet</p>

    <button @click="createEvent">Create Event</button>

    <NavigationBarBottom></NavigationBarBottom>
</template>

<style scoped>

</style>