<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api'
import { Song, SongFile } from '../models/Song';

const router = useRouter();
const route = useRoute();

const songId = route.params.id;

const SONG_API = "songs"

const songTitle = ref('');
const songArtist = ref('');
const songLyrics = ref('');
const songLinks = ref<string[]>([]);
const songFiles = ref<SongFile[]>([]);

async function loadSongDetails() :Promise<void>{
  try{
    const response = await api.get(`${SONG_API}/${songId}`);
    const song = response.data;
    songTitle.value = song.title;
    songArtist.value = song.artist;
    songLyrics.value = song.lyrics;
    songLinks.value = Array(song.links);
    songFiles.value = song.files;
    
  } catch(error){
    console.log("An error in showing song details has occured: " + error);
  }
}

async function download(songFile: SongFile){
  const filename = songFile.filepath.split("/")[1];
  console.log(songFile)
  try {
    const response = await api.get(`songs/download/${filename}`, {
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

onMounted(() => loadSongDetails());
</script>

<template>
  <h1>Song Details</h1>
    
    <h2>Title</h2>
    <p>{{ songTitle }}</p>
    <br>

    <h2>Artist</h2>
    <p>{{ songArtist }}</p>
    <br>

    <h2>Lyrics</h2>
      <div v-if="songLyrics.length !== 0">
        <p>{{ songLyrics }}</p>
      </div>
      <p v-else>*No lyrics were added to this composition*</p>
    <br>

    <h2>Links</h2>
      <ul>
        <li v-for="songLink in songLinks">
          {{ songLink }}
        </li>
      </ul>
    <br>
    <h2>Links</h2>
    <ul>
      <li v-for="file in songFiles">
        <p>{{ file.instrument }}: <em>{{ file.filepath.split("/")[1].split("-")[1]}}</em></p>
        <button @click="download(file)">Download</button>
      </li>
    </ul>
</template>

<style scoped>

</style>
