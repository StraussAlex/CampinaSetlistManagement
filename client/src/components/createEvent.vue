<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import  Event  from '../models/Event'
import api from '../services/api'
import { Setlist } from '../models/Setlist';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';

const router = useRouter();
const route = useRoute();
const editingId = route.params.id;
const originalCreationDate = ref<string>('');

const buttonText = ref<string>(isEditingRoute() ? "Update Event" : "Create Event");

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

function removeSetlist(index: number): void {
  setlistsInEvent.value.splice(index, 1);
}
function addSetlistToEvent(list: Setlist) {
  if(setlistAlreadyInEvent(list)) return;
  setlistsInEvent.value.push(list);
}
function setlistAlreadyInEvent(list: Setlist): boolean {
  for(let i: number = 0; i < setlistsInEvent.value.length; i++) {
    if(setlistsInEvent.value[i]._id == list._id) return true;
  }
  return false;
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
        router.push("/events")
    } catch(error) {
        errors.value.push("Error creating an event: " + error)
    }
};
</script>


<template>    
    <h1>{{ isEditingRoute() ? "Update Event" : "Create Event" }}</h1>
    <label for = "input-event-name">Event name</label>
    <input name = "input-event-name" v-model = "eventName">

    <br><br>

    <label for = "input-event-place">Event location</label>
    <input name = "input-event-place" v-model = "eventLocation">

    <br><br>

    <label for = "input-event-time">Event Date</label>
    <input type="datetime-local" name = "input-event-time" v-model = "eventDate">

    <br><br>

    <label for = "input-is-public">Public event</label>
    <input type="checkbox" name = "input-is-public" v-model = "eventIsPublic">
    <p style="font-size: x-small;">A public event can be displayed on the public landing page as an upcoming event. If you don't want this, keep the event private</p>

    <p>Setlists</p>
    <div>
        <ul v-if="setlistsInEvent.length !== 0">
        <li v-for="(list, index) in setlistsInEvent">{{ list.name }}
            <button @click="removeSetlist(index)">X</button>
        </li>
        </ul>
        <p v-else>No setlists</p>
    </div>

    <hr>

    <p>Setlist selection</p>
    <div>
        <ul v-if="setlists.length !== 0">
            <li v-for="list in setlists">{{ list.name }}
                <button @click="addSetlistToEvent(list)">Add setlist</button>
            </li>
        </ul>
        <p v-else>No setlists available</p>
    </div>

    <ul>
        <li v-for="error in errors">{{ error }}</li>
    </ul>

    <!-- <ul>
        <li v-for="warning in warnings">{{ warning }}</li>
    </ul> -->

    <button @click="createEvent">{{ buttonText }}</button>
    <button @click="deleteEvent" v-if="isEditingRoute()">Delete Event</button>

    <NavigationBarBottom></NavigationBarBottom>
</template>

<style scoped>

</style>
