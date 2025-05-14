<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Event from '../models/Event';
import api from '../services/api';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';
import SortAction from './elements/Sort-Action.vue';
import SearchBar from './elements/Search-Bar.vue';
import MobileNavBar from './elements/Mobile-Navigation-Bar.vue';

const router = useRouter();
function createEvent(): void {
  router.push('/create-event');
}
function viewEvent(eventId: any): void {
  router.push({ name: 'viewevent', params: { id: eventId } });
}

const EVENTS_API = 'events';
const events = ref<Event[]>([]);
const showAllEvents = ref<boolean>(false);

async function loadEvents(): Promise<void> {
  try {
    const response = await api.get(EVENTS_API);
    events.value = response.data.map((e: any) => {
      const event = new Event(
        e.name,
        e.location,
        e.date,
        e.setlistIds,
        e.isPublic,
        e.creationDate
      );
      event._id = e._id;
      return event;
    });
    filteredEvents.value = events.value;
    onSearchChange('');
    onSortingChanged('newest');
  } catch (error) {
    console.log('An error in showing the events has appeared: ' + error);
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

const filteredEvents = ref<Event[]>(events.value);
const currentQuery = ref<string>('');
function onSearchChange(query: string): void {
  currentQuery.value = query;
  filteredEvents.value = events.value.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  );
  onShowAllEventsChanged(filteredEvents.value);
  onSortingChanged(currentSort.value);
}

function onShowAllEventsChanged(preFilteredEvents: Event[]): void {
  labelNewest.value = showAllEvents.value ? 'Newest' : 'Upcoming next';
  labelOldest.value = showAllEvents.value ? 'Oldest' : 'Upcoming last';

  if (showAllEvents.value) return;

  filteredEvents.value = preFilteredEvents.filter((e: Event) => {
    return new Date(e.date) > new Date();
  });
}
const currentSort = ref<string>('newest');
function onSortingChanged(sort: string): void {
  currentSort.value = sort;
  const sortedEvents = [...filteredEvents.value];

  //! Events filtern nach dem event datum, nicht dem event erstellungs datum, theoretisch wird das creationDate feld nicht verwendet, beides
  //! einzubinden macht aber finde ich auch keinen sinn, bei events bietet es sich an nach event date zu filtern ig?
  //! Sollte eine alphabetische sortierung notwendig oder gewünscht sein, bitte code aus setlist oder song hereinkopieren, glaub aber nicht dass das hier
  //! sinn ergibt
  switch (sort) {
    case 'oldest':
      if (showAllEvents.value)
        sortedEvents.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      else
        sortedEvents.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      break;
    case 'newest':
      if (!showAllEvents.value)
        sortedEvents.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      else
        sortedEvents.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      break;
    default:
      //Wie bei sorted songs hab i einfach bei bugs oder so newest als default sorting
      sortedEvents.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      break;
  }

  filteredEvents.value = sortedEvents;
}

const labelNewest = ref<string>('Newest');
const labelOldest = ref<string>('Oldest');
</script>

<template>
  <h1 class="section-heading">Events</h1>

  <div>
    <SearchBar @search-change="onSearchChange"></SearchBar>
    <SortAction
      @sort-change="onSortingChanged"
      :sort-options="[
        { value: 'newest', display: labelNewest },
        { value: 'oldest', display: labelOldest },
      ]"
    ></SortAction>
    <br />
    <label for="input-show-all">Show all events</label>
    <input
      type="checkbox"
      name="input-show-all"
      v-model="showAllEvents"
      @change="onSearchChange(currentQuery)"
    />
  </div>

  <div v-if="filteredEvents.length !== 0" class="flex">
    <span v-for="event in filteredEvents">
      <button @click="viewEvent(event._id)" class="list">
        {{ event.name }} | {{ event.getFullDate }}
      </button>
    </span>
  </div>
  <p v-else>No events are created yet</p>

  <button @click="createEvent" class="btn-primary">Create Event</button>

  <!-- <NavigationBarBottom></NavigationBarBottom> -->
  <!-- Um "Mobile Nav Bar"-Ansicht zu aktivieren, ist "NavigationBarBottom"-Tag zu löschen und "MobileNavBar" zu unkommentieren -->
  <MobileNavBar></MobileNavBar>
</template>

<style scoped></style>
