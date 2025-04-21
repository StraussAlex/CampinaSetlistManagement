<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import  Event  from '../models/Event'
import api from '../services/api'

const router = useRouter();
const route = useRoute();
const editingId = route.params.id;

const buttonText = ref<string>(isEditingRoute() ? "Update Event" : "Create Event");

function isEditingRoute(): boolean {
  return route.name == "edit-event";
}

onMounted(async () => {
  try {
    const response = await api.get(`${EVENT_API}/${editingId}`)
    const event = response.data
    eventName.value = event.name;
    eventLocation.value = event.location;
    eventDate.value = event.date;
  } catch (error) {
    errors.value.push('Failed to load event')
  }
})

const EVENT_API = "events";

const eventName = ref<string>("");
const eventLocation = ref<string>("");
const eventDate = ref<string>("");

// let date: Date = new Date();

const errors = ref<string[]>([]);
const warnings = ref<string[]>([]);

async function deleteEvent(): Promise<void> {
    try {
        await api.delete(`${EVENT_API}/${editingId}`);
        router.push("/");
    } catch(error) {
        errors.value.push("Error deleting event: " + error);
    }
}

async function createEvent(): Promise<void> {
    eventName.value = eventName.value.trim();
    eventLocation.value = eventLocation.value.trim();
    eventDate.value = eventDate.value.trim();

    // eventMonth.value = eventMonth.value.trim();

    if(eventName.value.length === 0 || eventLocation.value.length === 0) {
        errors.value.push("Name or place of the event cannot be empty.");
    }
    //TODO datum validiern
    //Warnings machen so wenig sinn wenn man trotzdem speichern kann und weitergeleitet wird - man sieht sie nie?

    // if (eventYear.value < date.getFullYear()){
    //     warnings.value.push("This event is located in the past.");
    // }
    // proper validation
    /*if (eventYear.value === date.getFullYear && eventMonth.value < date.getMonth()){
            warnings.value.push("This event is located in the past.");
    }*/
    /*if (eventYear.value === date.getFullYear &&
          eventMonth.value === date.getMonth() &&
          eventDay.value < date.getDate()){
            warnings.value.push("This event is located in the past.");
    }*/

    if(errors.value.length > 0) return;


    const event = new Event(eventName.value, eventLocation.value, eventDate.value);

    try {
        if(isEditingRoute()) {
            await api.put(`${EVENT_API}/${editingId}`, event);
        } else {
            const response = await api.post(EVENT_API, event);
            event._id = response.data.insertedId;
        }
        router.push("/")
    } catch(error) {
        errors.value.push("Error creating an event: " + error)
    }
};
</script>


<template>    
    <h1>Create an Event</h1>
    <label for = "input-event-name">Event name</label>
    <input name = "input-event-name" v-model = "eventName">

    <br><br>

    <label for = "input-event-place">Event location</label>
    <input name = "input-event-place" v-model = "eventLocation">

    <br><br>

    <label for = "input-event-time">Event Date</label>
    <input type="datetime-local" name = "input-event-time" v-model = "eventDate">

    <ul>
        <li v-for="error in errors">{{ error }}</li>
    </ul>

    <ul>
        <li v-for="warning in warnings">{{ warning }}</li>
    </ul>

    <button @click="createEvent">{{ buttonText }}</button>
    <button v-if="isEditingRoute()">Delete Event</button>
</template>

<style scoped>

</style>
