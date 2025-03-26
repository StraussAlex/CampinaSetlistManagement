<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { Song, SongFile} from '../models/Song'
import { Setlist, SetlistSong} from '../models/Setlist'

import api from '../services/api'

//JUST MY TESTCODE FROM THE MONGODB SETUP, MIGHT USE SOME FUNCTIONS LATER, PLEASE DONT DELETE FOR NOW
const SONG_API = "songs";
const SETLIST_API = "setlists";

//Testing inserting songs
const title = ref<string>("");
const artist = ref<string>("");

const newSetlistName = ref<string>("");

const songs = ref<Song[]>([]);
const setlists = ref<Setlist[]>([]);

async function createNewSong(): Promise<void> {

  const songFiles: SongFile[] = [ new SongFile("Guitar", ["http://localhost:8888/myfiles/id"]), new SongFile("Saxophon", ["http://localhost:8888/myfiles/id2"])]
  const song = new Song(title.value, artist.value, "", ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"], songFiles);


  try {
    const response = await api.post(SONG_API, song);
    song._id = response.data.insertedId;
    console.log(response.data.insertedId);
  } catch(error) {
    console.error("Error saving data: ", error);
  }

  loadSongs();
}

async function loadSongs(): Promise<void> {
  try {
    const response = await api.get(SONG_API);
    songs.value = response.data;
    console.log(response);
  } catch(error) {
    console.log(error);
  }
}

async function createNewSetlist(): Promise<void> {
  const newList = new Setlist(newSetlistName.value, []);

  try {
    const response = await api.post(SETLIST_API, newList);
    newList._id = response.data.insertedId;
    console.log(response.data.insertedId);
  } catch(error) {
    console.error("Error saving data: ", error);
  }

  loadSetlists();
}

async function loadSetlists(): Promise<void> {
  try {
    const response = await api.get(SETLIST_API);
    setlists.value = response.data;
    console.log(response);
  } catch(error) {
    console.log(error);
  }
}
async function addSongToSetlist(song: Song, setlist: Setlist): Promise<void> {
  if(setlists.value.length === 0) return;

  let position: number = setlist.songs.length + 1;
  setlist.songs?.push(new SetlistSong(song._id, position));
  try {
    await api.put(`${SETLIST_API}/${setlist._id}`, setlist);
  } catch(error) {
    console.log(error);
  }

  loadSetlists();
}

onMounted(() => {loadSongs(); loadSetlists(); });

</script>

<template>
  <h1>Song Test</h1>
  <ul>
    <li v-for="song in songs">{{ song.artist }} - {{ song.title }} | {{ song._id }}
      <button v-for="file in song.files">Download {{ file.instrument }}</button>
      <button @click="addSongToSetlist(song, setlists[0])">Add to first list</button>
    </li>
  </ul>
  <input v-model="title">
  <input v-model="artist">
  <button @click="createNewSong">Save</button>

  <br><br>
  <input v-model="newSetlistName">
  <button @click="createNewSetlist">Create empty setlist</button>

  <br><br>

  <ul>
    <li v-for="list in setlists">{{ list.name }} contains {{ list.songs.length }} songs</li>
  </ul>
</template>

<style scoped>

</style>
