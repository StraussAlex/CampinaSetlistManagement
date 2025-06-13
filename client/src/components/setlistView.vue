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
import jsPDF from 'jspdf';
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

function songDetails(songId:any): void {
  router.push({ name: "viewsong", params: {id: String(songId)}});
}
function exportSetlist(): void {
  const doc: jsPDF = new jsPDF({
    orientation: 'p',
    format: 'a4',
    unit: 'mm',
    putOnlyUsedFonts: true
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const title = setlistName.value;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 30);

  doc.setLineWidth(0.5);
  doc.line(20, 35, pageWidth - 20, 35);

  doc.setFont('helvetica', 'normal');

  let y = 50;
  let lineHeight = 15;
  let fontSize = 20;

  if(setlistSongs.value.length > 16) {
    lineHeight = 10;
    fontSize = 18;
  }

  doc.setFontSize(fontSize);

  for (let i = 0; i < setlistSongs.value.length; i++) {
    const song = `${i + 1}. ${setlistSongs.value[i].title} | ${setlistSongs.value[i].artist}`;
    doc.text(song, 25, y);
    y += lineHeight;

    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  }

  doc.save(`${title}.pdf`);
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
    <button @click="editSetlist" class="btn-small-setlist-mobile">Edit</button>
    <button @click="exportSetlist" class="btn-small-setlist-mobile">Export</button>
  </mobile-header>
  <h1 class="section-heading">Setlist Details</h1>
  <button v-if="width > 600" @click="editSetlist" class="btn-small btn-inline-sectionheading">Edit</button>
  <button v-if="width > 600" @click="exportSetlist" class="btn-small btn-inline-sectionheading">Export</button>
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

h2 {
  word-wrap: break-word;
  padding: 0 40px;
}

.bottom-line::after{
  content: "";
  display: block;
  position: absolute;
  margin: 20px 5vw 0 5vw;
  width: 90vw;
  height: 1px;
  border-bottom: 1px solid var(--primary)
}

.btn-small-setlist-mobile{
  padding: 5px 10px;
  margin: 3px;
  background-color: var(--primary);
  border-color: var(--primary);
  color: var(--background);
  font-weight: 400;
  font-size: 15px;
}
</style>
