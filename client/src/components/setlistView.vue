<script setup lang="ts">
import { ref, onMounted, watchEffect, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api'
import { Setlist } from '../models/Setlist';
import { Song } from '../models/Song';

import MobileHeader from "./elements/Mobile-Header.vue";

import '/src/stylesheets/list.css'
import '/src/stylesheets/input.css'
import '/src/stylesheets/header.css'
import '/src/stylesheets/search.css'
import {useWindowSize} from "@vueuse/core";
const { width } = useWindowSize()

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

    const songsData: Song[] = await Promise.all(
      setlist.songs.map(async (songEntry: any) => {
        const songResponse = await api.get(`/songs/${songEntry.songId}`);
        const fullSong = songResponse.data;
        return { ...fullSong, position: songEntry.position };
      })
    );

    setlistSongs.value = songsData;
  } catch(error){
    console.log("An error in showing song details has occured: " + error);
  }
}

onMounted(() => loadSetlistDetails());
</script>

<template>
  <mobile-header v-if="width < 600">
    <button @click="editSetlist" class="btn-small">Edit</button>
  </mobile-header>
  <h1 class="section-heading">Setlist Details</h1>
  <button v-if="width > 600" @click="editSetlist" class="btn-small btn-inline-sectionheading">Edit</button>
  <h2>{{ setlistName }}</h2>

  <div class="content-container">
    <div v-if="setlistSongs.length !== 0" class="flex">
        <span v-for="setlistSong in setlistSongs">
          <div @click="songDetails(setlistSong._id)" class="list">{{ setlistSong.title }} | {{ setlistSong.artist }}</div>
        </span>
    </div>
    <p v-else> *No songs were added to this setlist*</p>
    <br>
  </div>
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
