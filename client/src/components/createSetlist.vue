<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { Song } from '../models/Song'
import { Setlist, SetlistSong } from '../models/Setlist'
import api from '../services/api'
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';

import 'stylesheets/input.css'
import 'stylesheets/header.css'
import 'stylesheets/search.css'
import 'stylesheets/overlay.css'
import 'stylesheets/list.css'

const router = useRouter();
const route = useRoute();
const editingId = route.params.id;


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
      const response = await api.get(`${SETLIST_API}/${editingId}`)
      const setlist = response.data

      setlistName.value = setlist.name

      const fullSongs = songs.value.filter(song =>
        setlist.songs.some((s: SetlistSong) => s.songId === song._id)
      )

      setlistSongs.value = fullSongs

    } catch (error) {
      console.log(error)
      errors.value.push("Failed to load setlist.")
    }
  }
});

const setlistName = ref<string>("");
const setlistSongs = ref<Song[]>([]);

function removeSong(index: number): void {
  setlistSongs.value.splice(index, 1);
}
function addSongToSetlist(song: Song) {
  if(songAlreadyInSetlist(song)) return;
  setlistSongs.value.push(song);
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
  const setlist = new Setlist(setlistName.value, songList);


  try {
    if(isEditingRoute()) {
      await api.put(`${SETLIST_API}/${editingId}`, setlist);
    } else {
      const response = await api.post(SETLIST_API, setlist);
      setlist._id = response.data.insertedId;
    }

    router.push("/setlists");

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

</script>

<template>
  <h1>Create Setlist</h1>

  <label for="input-setlist-name">Setlist Name</label>
  <input name="input-setlist-name" v-model="setlistName">

  <p>Setlist</p>
  <div>
    <ul v-if="setlistSongs.length !== 0">
      <li v-for="(song, index) in setlistSongs">{{ song.artist }} - {{ song.title }}
        <button @click="removeSong(index)">X</button>
      </li>
    </ul>
    <p v-else>Empty setlist</p>
  </div>

  <hr>

  <p>Song selection</p>
  <div>
    <ul v-if="songs.length !== 0">
      <li v-for="song in songs">{{ song.artist }} - {{ song.title }}
        <button @click="addSongToSetlist(song)">Add song</button>
      </li>
    </ul>
    <p v-else>No songs available</p>
  </div>

  <ul>
    <li v-for="error in errors">{{ error }}</li>
  </ul>

  <button @click="createNewSetlist">{{ buttonText }}</button>
  <button v-if="isEditingRoute()" @click="deleteSetlist()">Delete setlist</button>

  <NavigationBarBottom></NavigationBarBottom>
</template>

<style scoped>

</style>
