<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Event from '../models/Event'
import api from '../services/api'

const router = useRouter()
const route = useRoute()

const EVENT_API = "events";

const eventId = String(route.params.id) 
const errors = ref<string[]>([])
const warnings = ref<string[]>([])
const today = new Date()

const newName = ref('')
const newPlace = ref('')
const newTime = ref('')
const newDay = ref(0)
const newMonth = ref('')
const newYear = ref(0)

onMounted(async () => {
  try {
    const response = await api.get(`${EVENT_API}/${eventId}`)
    const event = response.data
    newName.value = event.name
    newPlace.value = event.place
    newTime.value = event.time
    newDay.value = event.day
    newMonth.value = event.month
    newYear.value = event.year
  } catch (error) {
    errors.value.push('Failed to load event')
  }
})

async function updateEvent(): Promise<void> {
  errors.value = []
  warnings.value = []

  const updatedEvent: Event = {
    _id: eventId,
    name: newName.value.trim(),
    place: newPlace.value.trim(),
    time: newTime.value.trim(),
    day: newDay.value,
    month: newMonth.value.trim(),
    year: newYear.value
  }

  if (!updatedEvent.name || !updatedEvent.place) {
    errors.value.push("Name or place can't be empty.")
    return
  }

  if (updatedEvent.day < 1 || updatedEvent.day > 31) {
    errors.value.push("Day must be between 1 and 31.")
  }

  if (updatedEvent.year < today.getFullYear()) {
    warnings.value.push("This event is in the past.")
  }

  try {
    await api.put(`${EVENT_API}/${eventId}`, updatedEvent)
    router.push('/')
  } catch (error) {
    errors.value.push("Error updating event: " + error)
  }
}
</script>



<template>    
    <h1>Edit an Event</h1>
    <label for = "input-event-name">Event name</label>
    <input name = "input-event-name" v-model = "newName">

    <br><br>

    <label for = "input-event-place">Event place</label>
    <input name = "input-event-place" v-model = "newPlace">

    <br><br>

    <label for = "input-event-time">Event time</label>
    <input name = "input-event-time" v-model = "newTime">

    <br><br>

    <label for = "input-event-day">Event day</label>
    <input name = "input-event-day" v-model = "newDay">

    <br><br>

    <label for = "input-event-month">Event month</label>
    <input name = "input-event-month" v-model = "newMonth">

    <br><br>

    <label for = "input-event-year">Event year</label>
    <input name = "input-event-year" v-model = "newYear">

    <ul>
        <li v-for="error in errors">{{ error }}</li>
    </ul>

    <ul>
        <li v-for="warning in warnings">{{ warning }}</li>
    </ul>

    <button @click="updateEvent">Save an event</button>
</template>

<style scoped>

</style>
