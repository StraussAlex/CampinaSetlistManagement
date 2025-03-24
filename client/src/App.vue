<script setup lang="ts">
import axios from 'redaxios'
import { ref, onMounted } from 'vue'

import Song from './models/Song'

const SONG_API = "http://localhost:3333/songs";

//Testing inserting songs
const title = ref<string>("");
const artist = ref<string>("");

const songs = ref<Song[]>([]);

async function saveSong(): Promise<void> {
  const song = {
		title: title.value,
		artist: artist.value
	};

	try {
		const response = await axios.post(SONG_API, song);
		console.log(response.data.insertedId);
	} catch(error) {
		console.error("Error saving data: ", error);
	}

  loadSongs();
}

async function loadSongs(): Promise<void> {
  try {
    const response = await axios.get(SONG_API);
    songs.value = response.data;
  } catch(error) {
    console.log(error);
  }
}

onMounted(() => loadSongs());

</script>

<template>
  <h1>Song Test</h1>
  <ul>
    <li v-for="song in songs">{{ song.artist }} - {{ song.title }}</li>
  </ul>
  <input v-model="title">
  <input v-model="artist">
  <button @click="saveSong"></button>
</template>

<style scoped>

</style>
