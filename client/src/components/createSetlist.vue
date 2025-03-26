<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { Song } from '../models/Song'
import { Setlist, SetlistSong } from '../models/Setlist'
import api from '../services/api'

const router = useRouter();

const SONG_API = "songs";
const songs = ref<Song[]>([]);
const SETLIST_API = "setlists";

const errors = ref<string[]>([]);

function clearErrors(): void {
  errors.value = [];
}

async function loadSongs(): Promise<void> {
  try {
    const response = await api.get(SONG_API);
    songs.value = response.data;
  } catch(error) {
    console.log(error);
  }
}

onMounted(() => loadSongs());

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
    const response = await api.post(SETLIST_API, setlist);
    setlist._id = response.data.insertedId;
    router.push("/setlists");

  } catch(error) {
    errors.value.push("Error saving song: " + error);
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
        <!-- TODO: Add functionality to move songs up and down -->
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

  <button @click="createNewSetlist">Save setlist</button>
</template>

<style scoped>

</style>
