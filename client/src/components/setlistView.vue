<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api'
import { Setlist } from '../models/Setlist';
import { Song } from '../models/Song';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';

const router = useRouter();
const route = useRoute();

const setlistId = route.params.id;

const SETLIST_API = "setlists";

const setlistName = ref('');
const setlistSongs = ref<Song[]>([]);

function editSetlist(): void {
  router.push({ name: 'edit-setlist', params: { id: String(setlistId) } });
}

function songDetails(songId:any){
  router.push({ name: "viewsong", params: {id: String(songId)}});
}
async function loadSetlistDetails() :Promise<void>{
  
  try{
    const response = await api.get(`${SETLIST_API}/${setlistId}`);
    const setlist = response.data;
    setlistName.value = setlist.name;

    const songsData: Song[] = [];

    for (const songEntry of setlist.songs) {
      const songResponse = await api.get(`/songs/${songEntry.songId}`);
      const fullSong = songResponse.data;
      songsData.push({ ...fullSong, position: songEntry.position });

      setTimeout(() => {
        setlistSongs.value = songsData;
      }, 200);
    }
  } catch(error){
    console.log("An error in showing song details has occured: " + error);
  }
}

onMounted(() => loadSetlistDetails());
</script>

<template>
  <h1>Setlist Details</h1>
  <h2>Name</h2>
    <p>{{ setlistName }}</p>

    <h2>Songs</h2>
      <ul v-if="setlistSongs.length !== 0">
        <li v-for="setlistSong in setlistSongs">
          {{ setlistSong.title }} - {{ setlistSong.artist }}<button @click="songDetails(setlistSong._id)">Details</button>
        </li>
      </ul>
      <p v-else> *No songs were added to this composition*</p>
    <br>
    
    <button @click="editSetlist">Edit</button>
    <NavigationBarBottom></NavigationBarBottom>
</template>

<style scoped>

</style>
