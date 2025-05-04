<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api'
import Event from '../models/Event';
import { Setlist } from '../models/Setlist';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';

const router = useRouter();
const route = useRoute();

const eventId = route.params.id;

const EVENTS_API = "events";

const eventName = ref('');
const eventLocation = ref('');
const eventDate = ref('');
const eventSetlists = ref<Setlist[]>([]);

function editEvent(): void {
  router.push({ name: 'edit-event', params: { id: String(eventId) } });
}

function setlistDetails(setlistId:any){
  router.push({ name: "viewsetlist", params: {id: String(setlistId)}});
}
async function loadEventDetails() :Promise<void>{
  
  try{
    const response = await api.get(`${EVENTS_API}/${eventId}`);
    const event: Event = new Event(response.data.name, response.data.location, response.data.date, response.data.setlistIds);
    eventName.value = event.name;
    eventLocation.value = event.location;
    eventDate.value = event.getFullDate;

    const setlistData: Setlist[] = [];

    for (const sl of event.setlistIds) {
      const setlistResponse = await api.get(`/setlists/${sl}`);
      const fullSetlist = setlistResponse.data;
      setlistData.push(fullSetlist);
    }
    eventSetlists.value = setlistData;
  } catch(error){
    console.log("An error in showing event details has occured: " + error);
  }
}

onMounted(() => loadEventDetails());
</script>

<template>
  <h1>Event Details</h1>
  
  <p>{{ eventName }}</p>
  <p>{{ eventLocation }}</p>
  <p>{{ eventDate }}</p>

  <h2>Setlists</h2>
    <ul v-if="eventSetlists.length !== 0">
      <li v-for="setlist in eventSetlists">
        {{ setlist.name }}<button @click="setlistDetails(setlist._id)">Details</button>
      </li>
    </ul>
    <p v-else> *There are no setlists assigned to this event*</p>
  <br>
    
  <button @click="editEvent">Edit</button>
  <NavigationBarBottom></NavigationBarBottom>
</template>

<style scoped>

</style>
