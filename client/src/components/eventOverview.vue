<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Event from '../models/Event';
import api from '../services/api';
import SortAction from './elements/Sort-Action.vue';
import SearchBar from './elements/Search-Bar.vue';
import MobileHeader from "./elements/Mobile-Header.vue";
import { useWindowSize } from '@vueuse/core'
const { width } = useWindowSize()

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

const DateFormatterShort = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
});
const DateFormatterLong = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
});
const TimeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: "numeric",
  minute: "numeric",
});


const labelNewest = ref<string>('Newest');
const labelOldest = ref<string>('Oldest');
</script>

<template>
  <mobile-header v-if="width < 600">
    <button @click="createEvent" class="btn-small">+ Add</button>
  </mobile-header>
    <div class="h-wrapper">
      <div class="visibility-wrapper">
        <h1 class="section-heading">Home</h1>
        <h2 class="bottom-line">Upcoming Events</h2>
    </div>
  </div>
  <div class="content-container">
    <div class="content-block">
      <div>
        <SearchBar @search-change="onSearchChange"></SearchBar>
        <SortAction
            @sort-change="onSortingChanged"
            :sort-options="[
        { value: 'newest', display: labelNewest },
        { value: 'oldest', display: labelOldest },
      ]"
        ></SortAction>
        <button v-if="width > 600" @click="createEvent" class="btn-small">+ Add</button>
        <br/>

        <label for="input-show-all">Show all events</label>
        <input
            type="checkbox"
            name="input-show-all"
            v-model="showAllEvents"
            @change="onSearchChange(currentQuery)"
        />
      </div>

      <div v-if="filteredEvents.length !== 0" class="flex">
        <div v-for="event in filteredEvents" @click="viewEvent(event._id)" class="EventWrapper">
          <div class="EventDate">
            <span v-if="width < 600">{{DateFormatterShort.format(new Date(event.date)).replace(' ', '. ')}}</span>
            <span v-else>{{DateFormatterLong.format(new Date(event.date)).replace(' ', '. ')}}</span>
          </div>
          <div class="EventName">
            <span>{{ event.name }}</span>
          </div>
          <div class="EventLocation">
            <span v-if="width > 600">Location: &nbsp;</span><span>{{event.location}}</span>
          </div>
          <div class="EventTime">
            <span v-if="width > 600">Time:&nbsp;{{TimeFormatter.format(new Date(event.date))}}</span>
          </div>
        </div>
      </div>
      <p v-else>No events are created yet</p>
    </div>

  </div>




  <!-- <NavigationBarBottom></NavigationBarBottom> -->
  <!-- Um "Mobile Nav Bar"-Ansicht zu aktivieren, ist "NavigationBarBottom"-Tag zu löschen und "MobileNavBar" zu unkommentieren -->
  <!-- <MobileNavBar></MobileNavBar> -->
</template>

<style scoped>

.bottom-line{
  padding-top: 7%;
  padding-bottom: 9%;
}
.h-wrapper{
  background-image: url("../assets/Icons/upcomingEvents.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-position-y: center;
  overflow-x: hidden;
}
.visibility-wrapper{
  background-color: color-mix(in srgb, var(--background) 30%, transparent);
  padding: 1% 0;
}
h1,h2{
  color: var(--text);
  text-shadow: var(--background) 2px 2px 3px;
}

.EventWrapper{
  display: flex;
  padding: 0 3vw;
  cursor: pointer;
}
.EventWrapper h3,h4,p,span{
  margin: 0;
  vertical-align: middle;
  display: inline-block;
  line-height: normal;
  font-family: "Krona One";
}
.EventWrapper{
  display: grid;
  margin: 20px;
  grid-template-columns: 35px 35px 20px auto auto;
  grid-template-rows: 35px 35px ;
  grid-template-areas:
  "date date . name name"
  "date date . location location";
}
.EventDate{
  grid-area: date;
  background-color: var(--secondary);
  line-height: 70px;
}
.EventDate span, .EventName span{
  font-size: 20px;
}
.EventName{
  grid-area: name;
  text-align: left;
  line-height: 35px;
}
.EventLocation{
  grid-area: location;
  text-align: left;
  line-height: 35px;
}
.EventTime{
  display: none;
  text-align: left;
}

@media only screen and (min-width: 600px) {
  div.flex:has(> .EventWrapper){
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: wrap;
  }
  .EventWrapper{
    flex-grow: 1;
    row-gap: 10px;
    width: 330px;
    background-color: var(--secondary-lighter);
    border-radius: 15px;
    padding: 20px;
    grid-template-columns: 70px 70px 0px auto auto;
    grid-template-rows: 35px 35px 35px 35px;
    grid-template-areas:
    "date date . name name"
    "date date . name name"
    "location location location location location"
    "time time time time time";
  }
  .EventDate{
    line-height: 80px;
  }
  .EventName{
    margin-left: -30px;
    padding-left: 50px;
    z-index: 1;
    background-color: var(--secondary-darker);
    line-height: 80px;
    border-radius: 15px;
  }
  .EventDate{
    border-radius: 15px;
    z-index: 2;
  }
  .EventLocation{
    grid-area: location;
  }
  .EventTime{
    display: inline-block;
    grid-area: time;
  }
}

</style>
