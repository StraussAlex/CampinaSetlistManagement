<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api'
import Event from '../models/Event';
import { Setlist } from '../models/Setlist';
import MobileHeader from "./elements/Mobile-Header.vue";
import {useWindowSize} from "@vueuse/core";
const { width } = useWindowSize()
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
const DateFormatter = new Intl.DateTimeFormat('en-GB');
onMounted(() => loadEventDetails());
</script>

<template>
  <mobile-header v-if="width < 600">
    <button @click="editEvent" class="btn-small">Edit</button>
  </mobile-header>
  <h1 class="section-heading">Event Details</h1>
  <button v-if="width > 600" @click="editEvent" class="btn-small btn-inline-sectionheading">Edit</button>
  <div class="content-container">

    <div class="details-box bottom-line">
      <h3>{{ eventName }}</h3>
    </div>

    <div class="details-box bottom-line">
      <h3>{{ eventLocation }}</h3>
    </div>

    <div class="details-box bottom-line">
      <h3>{{  eventDate }}</h3>
    </div>

    <div class="details-box bottom-line">
      <h3 v-if="eventIsPublic">This event is public</h3>
      <h3 v-else>This event is private</h3>
    </div>

    <div class="details-box">
      <h3>Setlists</h3>
      <div v-if="eventSetlists.length !== 0" class="flex">
      <span v-for="setlist in eventSetlists" >
         <div class="list" @click="setlistDetails(setlist._id)">
           <span>{{ setlist.name }}</span>
         </div>
      </span>
      </div>
      <p v-else> *There are no setlists assigned to this event*</p>
    </div>

  </div>

  <!-- <NavigationBarBottom></NavigationBarBottom> -->
  <!-- <MobileNavBar></MobileNavBar> -->
</template>

<style scoped>
  h3{
    text-align: center;
    margin:0;
  }
</style>
