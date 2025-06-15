<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import  Event  from '../models/Event'
import api from '../services/api'
import { Setlist } from '../models/Setlist';

import YesNoOverlay from "./elements/YesNo-Overlay.vue";
import SlotOverlay  from "./elements/SlotOverlay.vue"
import ErrorView from './elements/Error-View.vue';
import MobileHeader from "./elements/Mobile-Header.vue";
import {useWindowSize} from "@vueuse/core";
import SearchBar from "./elements/Search-Bar.vue";
import {Song} from "../models/Song.ts";
const { width } = useWindowSize()

const router = useRouter();
const route = useRoute();
const editingId = route.params.id;
const originalCreationDate = ref<string>('');

const buttonText = ref<string>(isEditingRoute() ? "Update Event" : "Create Event");

const overlayActive = ref<boolean>(false);
const overlayYesHandler = ref<() => void>(() => {});
const overlayText = ref<string>("")
const slotOverlayActive= ref<boolean>(false);

function isEditingRoute(): boolean {
  return route.name == "edit-event";
}

onMounted(async () => {
    await loadSetlists();

    if(isEditingRoute()) {
        try {
            const response = await api.get(`${EVENT_API}/${editingId}`)
            const event = response.data
            eventName.value = event.name;
            eventLocation.value = event.location;
            eventDate.value = event.date;
            eventIsPublic.value = event.isPublic;
            originalCreationDate.value = event.creationDate;

            const eventSetlists = setlists.value.filter(list =>
                event.setlistIds.some((s: any) => s === list._id)
            )

            setlistsInEvent.value = eventSetlists;
        } catch (error) {
            errors.value.push('Failed to load event')
        }
    }
})

async function loadSetlists(): Promise<void> {
  try {
    const response = await api.get(SETLIST_API);
    setlists.value = response.data;
  } catch(error) {
    errors.value.push("Error loading setlists: " + error);
  }
}

const EVENT_API = "events";
const SETLIST_API = "setlists";

const setlists = ref<Setlist[]>([]);
const setlistsInEvent = ref<Setlist[]>([]);

const eventName = ref<string>("");
const eventLocation = ref<string>("");
const eventDate = ref<string>("");
const eventIsPublic = ref<boolean>(false);
const filteredSetlists = ref<Setlist[]>(setlists.value);
const currentQuery = ref<string>("");


// Filtering Functions

function onSearchChange(query: string): void {
  currentQuery.value = query;
  filteredSetlists.value = setlists.value.filter(
    (setlist) =>
      setlist.name.toLowerCase().includes(query.toLowerCase()) &&
      !setlistAlreadyInEvent(setlist)
  );
}
function setlistAlreadyInEvent(list: Setlist): boolean {
  for(let i: number = 0; i < setlistsInEvent.value.length; i++) {
    if(setlistsInEvent.value[i]._id == list._id) return true;
  }
  return false;
}
function addSetlistToEvent(list: Setlist) {
  //if(setlistAlreadyInEvent(list)) return;
  setlistsInEvent.value.push(list);
  onSearchChange(currentQuery.value);
  filteredSetlists.value.filter(list => !setlistAlreadyInEvent(list));
}
function removeSetlist(index: number): void {
  setlistsInEvent.value.splice(index, 1);
  onSearchChange(currentQuery.value);
  filteredSetlists.value.filter(list => !setlistAlreadyInEvent(list));
}


// let date: Date = new Date();

const errors = ref<string[]>([]);
// const warnings = ref<string[]>([]);

async function deleteEvent(): Promise<void> {
    try {
        await api.delete(`${EVENT_API}/${editingId}`);
        router.push("/events");
    } catch(error) {
        errors.value.push("Error deleting event: " + error);
    }
}

async function createEvent(): Promise<void> {
    errors.value = [];
    eventName.value = eventName.value.trim();
    eventLocation.value = eventLocation.value.trim();
    eventDate.value = eventDate.value.trim();

    // eventMonth.value = eventMonth.value.trim();

    if(eventName.value.length === 0 || eventLocation.value.length === 0) {
        errors.value.push("Name or location of the event cannot be empty.");
    }

    if (!eventDate.value) {
        errors.value.push("Date of the event cannot be empty");
    } else {
        const date = new Date(eventDate.value);
        if (isNaN(date.getTime()) || eventDate.value.length < 16) {
            errors.value.push("Invalid date and time format. Please provide both.");
        }
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

    const setlistIds: any[] = [];
    for(let i = 0; i < setlistsInEvent.value.length; i++) {
        setlistIds.push(setlistsInEvent.value[i]._id);
    }

    //! Eigentlich gar nicht nötig, da in der express put route kein set feld fürs creation date existiert. Trotzdem zur sicherheit vorher abfragen?
    const creationDate = isEditingRoute() ? originalCreationDate.value : new Date().toISOString();
    const event = new Event(eventName.value, eventLocation.value, eventDate.value, setlistIds, eventIsPublic.value, creationDate);

    try {
        if(isEditingRoute()) {
            console.log(event.setlistIds.length);
            await api.put(`${EVENT_API}/${editingId}`, event);
        } else {
            const response = await api.post(EVENT_API, event);
            event._id = response.data.insertedId;
        }
        router.push(isEditingRoute() ? `/events/${editingId}` : 'events');
    } catch(error) {
        errors.value.push("Error creating an event: " + error)
    }
};

function activateOverlay(handler: () => void, text: string){
  overlayYesHandler.value = handler
  overlayText.value = text
  overlayActive.value = true
  console.log("isActive: " + overlayActive.value)
}
function toggleSlotOverlay(){
  slotOverlayActive.value = !slotOverlayActive.value
}

</script>


<template>
    <mobile-header v-if="width < 600">
      <button
          v-if="isEditingRoute()"
          @click='activateOverlay(deleteEvent, "Are you sure you want to delete this Event?")'
          class="btn-caution btn-small">Delete</button>
    </mobile-header>

    <h1 class="section-heading">{{ isEditingRoute() ? "Update Event" : "Create Event" }}</h1>

    <button
      v-if="isEditingRoute() && width > 600"
      @click='activateOverlay(deleteEvent, "Are you sure you want to delete this Event?")'
      class="btn-caution btn-small btn-inline-sectionheading">Delete</button>

  <ErrorView :errors="errors"></ErrorView>
    <div class="content-container">
      <div class="content-block">
        <div class="details-box bottom-line">
          <div class="labeled-input">
            <label for="input-event-name">Event name</label>
            <input name="input-event-name" v-model = "eventName">
          </div>
        </div>
        <div class="details-box bottom-line">
          <div class="labeled-input">
            <label for="input-event-place">Event location</label>
            <input name="input-event-place" v-model="eventLocation">
          </div>
        </div>
        <div class="details-box bottom-line">
          <div class="labeled-input">
            <label for = "input-event-time">Event Date</label>
            <input type="datetime-local" name = "input-event-time" v-model = "eventDate">
          </div>
        </div>
        <div class="details-box bottom-line">
          <div class="labeled-input">
            <label class="checkbox-wrapper">
              <input
                  name="input-is-public"
                  type="checkbox"
                  v-model="eventIsPublic"
                  class="checkbox-input"
              />
              <span class="custom-checkbox"></span>
              Public Event
            </label>
          </div>
        </div>
      </div>
      <span v-if="width > 600" class="vertical-divider"></span>
      <div class="content-block">
        <div class="details-box">
          <div class="labeled-input">
            <h3>Setlists</h3>
            <button @click="toggleSlotOverlay">Add Setlist</button>
              <div v-if="setlistsInEvent.length !== 0">
                <div class="list" v-for="(list, index) in setlistsInEvent">
                  <span>{{ list.name }}</span>
                  <button @click="removeSetlist(index)" class="btn-caution btn-square">X</button>
                </div>
              </div>
              <p v-else>No setlists</p>
          </div>
        </div>
      </div>
    </div>

    <button @click='activateOverlay(createEvent, "Are you sure you want to save this Event?")' class="btn-primary">{{ buttonText }}</button>
    <button @click='$router.go(-1)' class="btn-caution">Discard and return</button>
    <YesNoOverlay v-model="overlayActive" :text="overlayText" @yes="overlayYesHandler"></YesNoOverlay>

    <SlotOverlay v-model="slotOverlayActive">
      <h3>Select Setlists</h3>
      <SearchBar @search-change="onSearchChange"></SearchBar>
      <div>
        <div v-if="filteredSetlists.length !== 0">
          <div class="list" v-for="list in filteredSetlists">
            <span>{{ list.name }}</span>
            <button @click="addSetlistToEvent(list)" class="btn-secondary btn-small"> + </button>
          </div>
        </div>
        <p v-else>No setlists available</p>
      </div>
    </SlotOverlay>

    <!--<bottom-sheet-overlay ref="sheet"/> -->
</template>

<style scoped>
.h-wrapper{
  background-image: url("../assets/Icons/eventCreation.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-position-y: center;
  overflow-x: hidden;
}



.visibility-wrapper{
  background-color: color-mix(in srgb, var(--background) 20%, transparent);
  padding-bottom: 1%;
}

</style>
