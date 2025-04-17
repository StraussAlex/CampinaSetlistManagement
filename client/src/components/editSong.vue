<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Song } from '../models/Song'
import api from '../services/api'

const router = useRouter()
const route = useRoute()

const SONGS_API = "songs/edit-song";

const songId = String(route.params.id) 
const errors = ref<string[]>([])
const warnings = ref<string[]>([])

const newTitle = ref('');
const newArtist = ref('');
const newLyrics = ref('');
const newLinks = ref([]);
const newFiles = ref([]);

onMounted(async () => {
  try {
    const response = await api.get(`${SONGS_API}/${songId}`);
    const song = response.data;
    newTitle.value = song.title;
    newArtist.value = song.artist;
    newLyrics.value = song.lyrics;
    newLinks.value = song.links;
    newFiles.value = song.files;
  } catch (error) {
    errors.value.push('Failed to load a song');
  }
})

async function updateSong(): Promise<void> {
  errors.value = []
  warnings.value = []

  const updatedSong: Song = {
    _id: songId,
    title: newTitle.value.trim(),
    artist: newArtist.value.trim(),
    lyrics: newLyrics.value.trim(),
    links: newLinks.value,
    files: newFiles.value
  }

  if (!updatedSong.title || !updatedSong.artist) {
    errors.value.push("Title or artist can't be empty.")
    return
  }

  try {
    await api.put(`${SONGS_API}/${songId}`, updatedSong)
    router.push('/songs')
  } catch (error) {
    errors.value.push("Error updating song: " + error)
  }
}
</script>

<template>    
    <h1>Edit a song</h1>
    <label for = "input-song-title">Title</label>
    <input name = "input-event-title" v-model = "newTitle">

    <br><br>

    <label for = "input-song-artist">Artist</label>
    <input name = "input-event-artist" v-model = "newArtist">

    <br><br>

    <label for = "input-song-lyrics">Lyrics</label>
    <input name = "input-event-lyrics" v-model = "newLyrics">

    <br><br>

    <label for = "input-song-links">Links</label>
    <input name = "input-event-links" v-model = "newLinks">

    <br><br>

    <label for = "input-song-files">Files</label>
    <input name = "input-event-files" v-model = "newFiles">

    <br><br>

    <ul>
        <li v-for="error in errors">{{ error }}</li>
    </ul>

    <ul>
        <li v-for="warning in warnings">{{ warning }}</li>
    </ul>

    <button @click="updateSong">Save a song</button>
</template>

<style scoped>

</style>
