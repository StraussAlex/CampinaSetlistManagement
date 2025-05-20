<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { Song } from '../models/Song'
import { Setlist, SetlistSong } from '../models/Setlist'
import api from '../services/api'
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';
import MobileNavBar from './elements/Mobile-Navigation-Bar.vue';
import BottomSheetOverlay from "./elements/Bottom-Sheet-Overlay.vue"
import YesNoOverlay from "./elements/YesNo-Overlay.vue";
import draggableComponent from 'vuedraggable';

import '/src/stylesheets/input.css'
import '/src/stylesheets/header.css'
import '/src/stylesheets/search.css'
import '/src/stylesheets/list.css'
import ErrorView from './elements/Error-View.vue';
import MobileHeader from "./elements/Mobile-Header.vue";

const router = useRouter();
const route = useRoute();
const editingId = route.params.id;
const originalCreationDate = ref<string>('');

const overlayActive = ref<boolean>(false);
const overlayYesHandler = ref<() => void>(() => {});
const overlayText = ref<string>("")


const SONG_API = "songs";
const songs = ref<Song[]>([]);
const availableSongs = ref<Song[]>([]);
const SETLIST_API = "setlists";

const buttonText = ref<string>(isEditingRoute() ? "Update setlist" : "Save setlist");
const errors = ref<string[]>([]);

function clearErrors(): void {
  errors.value = [];
}
function isEditingRoute(): boolean {
  return route.name == "edit-setlist";
}

async function loadSongs(): Promise<void> {
  try {
    const response = await api.get(SONG_API);
    songs.value = response.data;

    availableSongs.value = [];
    for(let i = 0; i < songs.value.length; i++) {
      if(!songAlreadyInSetlist(songs.value[i])) availableSongs.value.push(songs.value[i]);
    }

  } catch(error) {
    errors.value.push("Error loading songs: " + error);
  }
}

onMounted(async() => {

  await loadSongs();

  if(isEditingRoute()) {
    try {
      const response = await api.get(`${SETLIST_API}/${editingId}`);
      const setlist = response.data;

      setlistName.value = setlist.name;
      originalCreationDate.value = setlist.creationDate;

      const songPositions = new Map<any, number>(setlist.songs.map((s: SetlistSong) => [s.songId, s.position]));

      const fullSongs = songs.value
        .filter(song => songPositions.has(song._id))
        .sort((a, b) => {
          return (songPositions.get(a._id) ?? 0) - (songPositions.get(b._id) ?? 0);
        })

      setlistSongs.value = fullSongs;

    } catch (error) {
      console.log(error);
      errors.value.push("Failed to load setlist.");
    }
  }
  setupSheet();
});

const setlistName = ref<string>("");
const setlistSongs = ref<Song[]>([]);

function removeSong(index: number): void {
  setlistSongs.value.splice(index, 1);

  availableSongs.value = [];
  for(let i = 0; i < songs.value.length; i++) {
    if(!songAlreadyInSetlist(songs.value[i])) availableSongs.value.push(songs.value[i]);
  }
}
function addSongToSetlist(song: Song) {
  if(songAlreadyInSetlist(song)) return;

  setlistSongs.value.push(song);

  availableSongs.value = [];
  for(let i = 0; i < songs.value.length; i++) {
    if(!songAlreadyInSetlist(songs.value[i])) availableSongs.value.push(songs.value[i]);
  }
}
function songAlreadyInSetlist(song: Song): boolean {
  for(let i: number = 0; i < setlistSongs.value.length; i++) {
    if(setlistSongs.value[i]._id == song._id) return true;
  }
  return false;
}

async function createNewSetlist(): Promise<void> {
  clearErrors();

  setlistName.value = setlistName.value.trim();
  if(setlistName.value.length === 0) errors.value.push("Setlist name cannot be empty");
  
  if(errors.value.length > 0) return;

  let songList: SetlistSong[] = [];
  for(let i: number = 0; i < setlistSongs.value.length; i++) {
    const entry = new SetlistSong(setlistSongs.value[i]._id, i + 1);
    songList.push(entry);
  }

  //! Eigentlich gar nicht nötig, da in der express put route kein set feld fürs creation date existiert. Trotzdem zur sicherheit vorher abfragen?
  const creationDate = isEditingRoute() ? originalCreationDate.value : new Date().toISOString();
  const setlist = new Setlist(setlistName.value, songList, creationDate);


  try {
    if(isEditingRoute()) {
      await api.put(`${SETLIST_API}/${editingId}`, setlist);
    } else {
      const response = await api.post(SETLIST_API, setlist);
      setlist._id = response.data.insertedId;
    }

    router.push(isEditingRoute() ? `/setlists/${editingId}` : '/setlists');

  } catch(error) {
    errors.value.push("An error occurred: " + error);
  }
}

async function deleteSetlist(): Promise<void> {
  if(!isEditingRoute()) return;

  try {
    await api.delete(`${SETLIST_API}/${editingId}`);
    router.push("/setlists");
  } catch(error) {
    errors.value.push("Error deleting setlist: " + error);
  }
}
function activateOverlay(handler: () => void, text: string){
  overlayYesHandler.value = handler
  overlayText.value = text
  overlayActive.value = true
  console.log("isActive: " + overlayActive.value)
}

const sheetRef = ref<InstanceType<typeof BottomSheetOverlay> | null>(null);
const setupSheet = () => {
    sheetRef.value?.setupBottomSheet();
}
const openSheet = () => {
  sheetRef.value?.openBottomSheetWithBtn(70);
}

</script>

<template>
  <mobile-header>
    <button v-if="isEditingRoute()" @click='activateOverlay(deleteSetlist, "Are you sure you want to delete this Setlist?")' class="btn-caution btn-small">Delete</button>
  </mobile-header>
  <h1 class="section-heading">{{ isEditingRoute() ? "Update Setlist" : "Create Setlist" }}</h1>
  <div class="mobile-container">
    <ErrorView :errors="errors"></ErrorView>

    <div class="details-box border-bottom">
      <label for="input-setlist-name">Setlist Name</label>
      <input name="input-setlist-name" v-model="setlistName">
    </div>


  <p>Setlist</p>

<!-- Old code from before I added dragging -->
  <!-- <div v-if="setlistSongs.length !== 0" class="flex">
    <span v-for="(setlistSong, index) in setlistSongs">
      <div class="list">{{ setlistSong.title }} | {{ setlistSong.artist }}
        <button @click="removeSong(index)" class="btn-caution btn-square">X</button>
      </div>
    </span>
  </div>
  <p v-else>Empty setlist</p> -->

  <draggableComponent
    v-model="setlistSongs"
    item-key="_id"
    class="flex"
    :animation="200">

    <template #item="{ element, index }">
      <div class="list">
        {{ index + 1 }}. {{ element.title }} | {{ element.artist }}
        <button @click="removeSong(index)" class="btn-caution btn-square">X</button>
      </div>
    </template>
  </draggableComponent>

<!-- Old code from where i  -->
  <!-- <div>
    <ul v-if="setlistSongs.length !== 0">
      <li v-for="(song, index) in setlistSongs">{{ song.artist }} - {{ song.title }}
        <button @click="removeSong(index)" class="btn-caution btn-square">X</button>
      </li>
    </ul>
    <p v-else>Empty setlist</p>
  </div> -->

    <p>Song selection</p>
    <div>
      <ul v-if="songs.length !== 0">
        <li v-for="song in songs">{{ song.artist }} - {{ song.title }}
          <button @click="addSongToSetlist(song)" class="btn-secondary btn-small"> + Add song</button>
        </li>
      </ul>
      <p v-else>No songs available</p>
    </div>
    <button @click="openSheet">Overlay</button>
    <button @click='activateOverlay(createNewSetlist, "Are you sure you want to save this Setlist?")' class="btn-primary">{{ buttonText }}</button>

  </div>
  <YesNoOverlay v-model="overlayActive" :text="overlayText" @yes="overlayYesHandler"></YesNoOverlay>

  <!-- <NavigationBarBottom></NavigationBarBottom> -->
  <!-- <MobileNavBar></MobileNavBar> -->
  <BottomSheetOverlay ref="sheetRef" @add-song="addSongToSetlist"/>
</template>

<style scoped>

</style>
