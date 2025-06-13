<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { Song } from '../models/Song'
import { Setlist, SetlistSong } from '../models/Setlist'
import api from '../services/api'

import BottomSheetOverlay from "./elements/Bottom-Sheet-Overlay.vue"
import YesNoOverlay from "./elements/YesNo-Overlay.vue";
import draggableComponent from 'vuedraggable';

import '/src/stylesheets/input.css'
import '/src/stylesheets/header.css'
import '/src/stylesheets/search.css'
import '/src/stylesheets/list.css'
import ErrorView from './elements/Error-View.vue';
import MobileHeader from "./elements/Mobile-Header.vue";
import SearchBar from './elements/Search-Bar.vue';
import {useWindowSize} from "@vueuse/core";

const { width } = useWindowSize()
const router = useRouter();
const route = useRoute();
const editingId = route.params.id;
const originalCreationDate = ref<string>('');

const overlayActive = ref<boolean>(false);
const overlayYesHandler = ref<() => void>(() => {});
const overlayText = ref<string>("")


const SONG_API = "songs";
const songs = ref<Song[]>([]);
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
      onSearchChange("");

    } catch (error) {
      console.log(error);
      errors.value.push("Failed to load setlist.");
    }
  }
  setupSheet();
  onSearchChange("");
});

const setlistName = ref<string>("");
const setlistSongs = ref<Song[]>([]);

function removeSong(index: number): void {
  setlistSongs.value.splice(index, 1);
  onSearchChange(currentQuery.value);
  filteredSongs.value.filter(song => !songAlreadyInSetlist(song));
}

function addSongToSetlist(song: Song) {
  //if(songAlreadyInSetlist(song)) return;
  setlistSongs.value.push(song);
  onSearchChange(currentQuery.value);
  filteredSongs.value.filter(song => !songAlreadyInSetlist(song));
}

watch(setlistSongs.value, () => {
  onSearchChange(currentQuery.value);
});

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

const filteredSongs = ref<Song[]>(songs.value);
const currentQuery = ref<string>("");

function onSearchChange(query: string): void {
  currentQuery.value = query;
  filteredSongs.value = songs.value.filter(
    (song) =>
      (song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())) &&
      !songAlreadyInSetlist(song)
  );
}
</script>

<template>
  <mobile-header v-if="width < 600">
    <button
        v-if="isEditingRoute()"
        @click='activateOverlay(deleteSetlist, "Are you sure you want to delete this Setlist?")'
        class="btn-caution btn-small">Delete</button>
  </mobile-header>
  <h1 class="section-heading">{{ isEditingRoute() ? "Update Setlist" : "Create Setlist" }}</h1>
  <button
      v-if="isEditingRoute() && width > 600"
      @click='activateOverlay(deleteSetlist, "Are you sure you want to delete this Setlist?")'
      class="btn-caution btn-small btn-inline-sectionheading">Delete</button>
  <ErrorView :errors="errors"></ErrorView>
  <div class="content-container fitScreenHeight">
    <div class="content-block">
      <div class="details-box bottom-line">
        <div class=" labeled-input">
          <label for="input-setlist-name">Setlist Name</label>
          <input name="input-setlist-name" v-model="setlistName">
        </div>
      </div>
      <div class="scrollable-container">
        <draggableComponent
            v-model="setlistSongs"
            item-key="_id"
            class="flex"
            :animation="200">

          <template #item="{ element, index }">
            <div class="list">
              <span>{{ index + 1 }}. {{ element.title }} | {{ element.artist }}</span>
              <button @click="removeSong(index)" class="btn-caution btn-square">X</button>
            </div>
          </template>
        </draggableComponent>
      </div>
    </div>
    <span v-if="width > 600" class="vertical-divider"></span>
    <div v-if="width > 600" class="content-block">
      <SearchBar @search-change="onSearchChange"></SearchBar>
      <div class="scrollable-container">
        <div v-if="filteredSongs.length !== 0">
          <div class="list" v-for="song in filteredSongs">
            <span>{{ song.artist }} - {{ song.title }}</span>
            <button @click="addSongToSetlist(song)" class="btn-secondary btn-small"> + Add song</button>
          </div>
        </div>
        <p v-else>No songs available</p>
      </div>
    </div>

  </div>
  <button @click='activateOverlay(createNewSetlist, "Are you sure you want to save this Setlist?")' class="btn-primary">{{ buttonText }}</button>
  <button @click='$router.go(-1)' class="btn-caution">Discard and return</button>

  <YesNoOverlay v-model="overlayActive" :text="overlayText" @yes="overlayYesHandler"></YesNoOverlay>

  <!-- <NavigationBarBottom></NavigationBarBottom> -->
  <!-- <MobileNavBar></MobileNavBar> -->
  <div v-if="width < 600" class="round-btn" @click="openSheet">
    <div class="horizontal"></div>
    <div class="vertical"></div>
  </div>
  <BottomSheetOverlay v-if="width < 600" :setlist-songs="setlistSongs" ref="sheetRef" @add-song="addSongToSetlist"/>
</template>

<style scoped>
.round-btn {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: var(--primary);
  position: fixed;
  right: 2.1vw;
  bottom: 103px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
  transition: transform 0.2s ease-in, background-color 0.2s ease-in;
}

.round-btn:hover {
  background-color: var(--primary-darker);
}

.horizontal, .vertical {
  position: absolute;
  background-color: var(--background);
  border-radius: 100px;
}

.horizontal {
  width: 40px;
  height: 7px;
}

.vertical {
  width: 7px;
  height: 40px;
}

@media only screen and (max-width: 500px){
  .round-btn {
    width: 60px;
    height: 60px;
  }

  .horizontal {
    width: 24px;
    height: 4px;
  }

  .vertical {
    width: 4px;
    height: 24px;
  } 
  @media only screen and (max-height: 950px){
    .round-btn{
      bottom: 9.7%;
    }
  }
}

@media only screen and (min-height: 950px){
  .round-btn {
    width: 100px;
    height: 100px;
  }
  .horizontal {
    width: 40px;
    height: 7px;
  }

  .vertical {
    width: 7px;
    height: 40px;
  } 
  
}

</style>
