<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api'
import { Song, SongFile } from '../models/Song';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';
import MobileNavBar from './elements/Mobile-Navigation-Bar.vue';
import MobileHeader from "./elements/Mobile-Header.vue";

import '/src/stylesheets/list.css'
import '/src/stylesheets/input.css'
import '/src/stylesheets/header.css'
import '/src/stylesheets/search.css'


const router = useRouter();
const route = useRoute();

const songId = route.params.id;

const SONG_API = "songs"

const songTitle = ref<string>('');
const songArtist = ref<string>('');
const songLyrics = ref<string>('');
const songNotes = ref<string>('');
const songLinks = ref<string[]>([]);
const songFiles = ref<SongFile[]>([]);

function editSong(): void {
  router.push({ name: "edit-song", params: {id: String(songId)}});
}

async function loadSongDetails() :Promise<void>{
  try{
    const response = await api.get(`${SONG_API}/${songId}`);
    const song = response.data;
    songTitle.value = song.title;
    songArtist.value = song.artist;
    songLyrics.value = song.lyrics;
    songNotes.value = song.notes;
    songLinks.value = Array(song.links);
    songFiles.value = song.files;

    lyricsDisplay.value = song.lyrics.split('\n')[0] + "\n...";
    
  } catch(error){
    console.log("An error in showing song details has occured: " + error);
  }
}

async function download(songFile: SongFile){
  const filename = songFile.filepath.split("/")[1];
  console.log(songFile)
  try {
    const response = await api.get(`songs/file/${filename}`, {
      responseType: "blob"
    });

    const url = window.URL.createObjectURL(new File([response.data], filename, { type: response.headers.get("content-type")!}))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename.split("-")[1])
    document.body.appendChild(link)
    link.click()
  } catch (error) {
    console.error('Error downloading the song file:', error);
  }
}
const lyricsExpandBtnLabel = ref<string>('⬇️');
const lyricsExpanded = ref<boolean>(false);

const lyricsDisplay = ref<string>("");
function toggleLyricsExpand(): void {
  lyricsExpanded.value = !lyricsExpanded.value;
  lyricsExpandBtnLabel.value = lyricsExpanded.value ? '⬆️' : '⬇️';

  lyricsDisplay.value = lyricsExpanded.value ? songLyrics.value : lyricsDisplay.value = songLyrics.value.split('\n')[0] + "\n...";
}
function copyLyricsToClipBoard(): void {
  navigator.clipboard.writeText(songLyrics.value);
}

onMounted(() => loadSongDetails());
</script>

<template>
  <mobile-header>
    <button @click="editSong" class="btn-small">Edit</button>
  </mobile-header>
  <h1 class="section-heading">Song Details</h1>
  <div class="mobile-container">

    <div class="details-box bottom-line">
      <h2>{{ songTitle }}</h2>
      <h3>{{ songArtist }}</h3>
    </div>

    <!-- Irgendwie vlt schön formatieren mit den breaks und so idk -->
    <!-- jaja, ich mach ja schon  -->

    <div class="details-box bottom-line">
      <h3>Additional Information</h3>
      <div v-if="songNotes.length !== 0">
        <pre>{{ songNotes }}</pre>
      </div>
      <p v-else>*No Notes were added to this song*</p>

    </div>

    <div class="details-box bottom-line">
      <h3>Lyrics</h3>
      <button v-if="songLyrics.length !== 0" @click="toggleLyricsExpand">{{ lyricsExpandBtnLabel }}</button>
      <button v-if="songLyrics.length !== 0" @click="copyLyricsToClipBoard">📋</button>
        <div v-if="songLyrics.length !== 0">
          <pre>{{ lyricsDisplay }}</pre>
        </div>
        <p v-else>No lyrics were added to this song</p>
    </div>

    <div class="details-box bottom-line">
      <h3>Links</h3>
      <ul>
        <li v-for="songLink in songLinks">
          {{ songLink }}
        </li>
      </ul>
    </div>

    <div class="details-box bottom-line" v-for="file in songFiles">
      <h3>{{ file.instrument }}: {{ file.filepath.split("/")[1].split("-")[1] }}</h3>
      <button @click="download(file)" class="btn-small">Download</button>
    </div>
  </div>
  <!-- <NavigationBarBottom></NavigationBarBottom> -->
  <!-- <MobileNavBar></MobileNavBar> -->
</template>

<style scoped>

</style>
