<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import  Event  from '../models/Event'
import api from '../services/api'

const router = useRouter();

const EVENT_API = "";

const eventName = ref<string>("");
const eventPlace = ref<string>("");
const eventTime = ref<string>("");
const eventDay = ref<number>(0);
//const eventMonth = ref<number>(0); if we want to make a proper validation
const eventMonth = ref<string>("");
const eventYear = ref<number>(0);

let date: Date = new Date();

const errors = ref<string[]>([]);
const warnings = ref<string[]>([]);

async function createEvent(): Promise<void> {
    eventName.value = eventName.value.trim();
    eventPlace.value = eventPlace.value.trim();
    eventTime.value = eventTime.value.trim();
    eventMonth.value = eventMonth.value.trim();

    if (eventName.value.length === 0 || eventPlace.value.length === 0) {
        errors.value.push("Name or place of the event cannot be empty.");
    }
    if (eventDay.value < 1 || eventDay.value > 31){
        errors.value.push("Day number cannot be less than 1 and bigger than 31.");
    }
    if (eventYear.value < date.getFullYear()){
        warnings.value.push("This event is located in the past.");
    }
    // proper validation
    /*if (eventYear.value === date.getFullYear && eventMonth.value < date.getMonth()){
            warnings.value.push("This event is located in the past.");
    }*/
    /*if (eventYear.value === date.getFullYear &&
          eventMonth.value === date.getMonth() &&
          eventDay.value < date.getDate()){
            warnings.value.push("This event is located in the past.");
    }*/

    const event = new Event(eventName.value, eventPlace.value, eventTime.value, 
                            eventDay.value, eventMonth.value, eventYear.value);
    try {
        const response = await api.post(EVENT_API,event);
        event._id = response.data.insertedId;

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

    <label for = "input-event-place">Event place</label>
    <input name = "input-event-place" v-model = "eventPlace">

    <br><br>

    <label for = "input-event-time">Event time</label>
    <input name = "input-event-time" v-model = "eventTime">

    <br><br>

    <label for = "input-event-day">Event day</label>
    <input name = "input-event-day" v-model = "eventDay">

    <br><br>

    <label for = "input-event-month">Event month</label>
    <input name = "input-event-month" v-model = "eventMonth">

    <br><br>

    <label for = "input-event-year">Event year</label>
    <input name = "input-event-year" v-model = "eventYear">

    <ul>
        <li v-for="error in errors">{{ error }}</li>
    </ul>

    <ul>
        <li v-for="warning in warnings">{{ warning }}</li>
    </ul>

    <button @click="createEvent">Save an event</button>
</template>

<style scoped>

</style>
