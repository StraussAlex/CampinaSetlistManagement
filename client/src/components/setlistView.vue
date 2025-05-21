<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api'
import { Setlist } from '../models/Setlist';
import { Song } from '../models/Song';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';
import MobileNavBar from './elements/Mobile-Navigation-Bar.vue';
import MobileHeader from "./elements/Mobile-Header.vue";

import '/src/stylesheets/list.css'
import '/src/stylesheets/input.css'
import '/src/stylesheets/header.css'
import '/src/stylesheets/search.css'


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
  <mobile-header>
    <button @click="editSetlist" class="btn-small">Edit</button>
  </mobile-header>
  <h1 class="section-heading">Setlist Details</h1>
  <h2 class="bottom-line">{{ setlistName }}</h2>
  <div class="content-container">

    <!-- <p>{{ setlistName }}</p> -->

    <!-- <h2>Songs</h2> -->
    <div v-if="setlistSongs.length !== 0" class="flex">
        <span v-for="setlistSong in setlistSongs">
          <div @click="songDetails(setlistSong._id)" class="list">{{ setlistSong.title }} | {{ setlistSong.artist }}</div>
        </span>
    </div>
    <!-- <ul v-if="setlistSongs.length !== 0">
      <li v-for="setlistSong in setlistSongs">
        <button @click="songDetails(setlistSong._id)" class="btn-secondary">{{ setlistSong.title }} | {{ setlistSong.artist }}</button>
      </li>
    </ul> -->
    <p v-else> *No songs were added to this setlist*</p>
    <br>
  </div>

    

    <!-- <NavigationBarBottom></NavigationBarBottom> -->
    <!-- <MobileNavBar></MobileNavBar> -->
</template>

<style scoped>
.bottom-line::after{
  content: "";
  display: block;
  position: absolute;
  margin: 20px 5vw 0 5vw;
  width: 90vw;
  height: 1px;
  border-bottom: 1px solid var(--primary)
}
</style>
