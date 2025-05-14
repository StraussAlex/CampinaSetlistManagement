<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api'
import Event from '../models/Event';
import { Setlist } from '../models/Setlist';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';
import MobileNavBar from './elements/Mobile-Navigation-Bar.vue';

const router = useRouter();
const route = useRoute();

const eventId = route.params.id;

const EVENTS_API = "events";

const eventName = ref<string>('');
const eventLocation = ref<string>('');
const eventDate = ref<string>('');
const eventIsPublic = ref<boolean>(false);
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
    const event: Event = new Event(response.data.name, response.data.location, response.data.date, response.data.setlistIds, response.data.isPublic, response.data.creationDate);
    eventName.value = event.name;
    eventLocation.value = event.location;
    eventDate.value = event.getFullDate;
    eventIsPublic.value = event.isPublic;

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

  <p v-if="eventIsPublic">This event is public</p>
  <p v-else>This event is private</p>

  <h3>Setlists</h3>
    <div v-if="eventSetlists.length !== 0" class="flex">
      <span v-for="setlist in eventSetlists" >
         <button class="list" @click="setlistDetails(setlist._id)">{{ setlist.name }}</button>
      </span>
    </div>
    <p v-else> *There are no setlists assigned to this event*</p>
  <br>
    
  <button @click="editEvent" class="btn-primary">Edit</button>
  <!-- <NavigationBarBottom></NavigationBarBottom> -->
   <MobileNavBar></MobileNavBar> 
</template>

<style scoped>

</style>
