<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { Song, SongFile} from '../models/Song'
import api from '../services/api'
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';

const router = useRouter();

const SONG_API = "songs";
const songs = ref<Song[]>([]);

async function loadSongs(): Promise<void> {
  try {
    const response = await api.get(SONG_API);
    songs.value = response.data;
  } catch(error) {
    console.log(error);
  }
}
function createNewSong(): void {
  router.push("/create-song");
}
function editSong(songId: string): void {
  router.push({ name: "edit-song", params: {id: String(songId)}});
}
function viewSong(songId: any): void {
  console.log(songId);
  router.push({ name: 'viewsong', params: { id: songId } })
}

onMounted(() => loadSongs());

</script>

<template>
  <h1>Songs</h1>
  <ul v-if="songs.length !== 0">
    <li v-for="song in songs">{{ song.artist }} - {{ song.title }}
      <button @click="viewSong(song._id)">View song</button>
      <button @click="editSong(song._id)">Edit song</button>
    </li>
  </ul>
  <p v-else>No songs yet</p>

  <button @click="createNewSong">Create new song</button>

  <NavigationBarBottom></NavigationBarBottom>
</template>

<style scoped>

</style>
