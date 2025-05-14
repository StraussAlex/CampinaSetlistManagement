<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api'
import { Song, SongFile } from '../models/Song';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';
import MobileNavBar from './elements/Mobile-Navigation-Bar.vue';

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

onMounted(() => loadSongDetails());
</script>

<template>


    <div class="details-box">
    <h2>{{ songTitle }}</h2>
    <h3>{{ songArtist }}</h3>
    </div>

    <br>

    <!-- Irgendwie vlt schön formatieren mit den breaks und so idk -->
     <!-- jaja, ich mach ja schon  -->
    <div class="details-box">
    <h3 >Additional Information</h3>
    <p>{{ songNotes }}</p>
    </div>
    <br>

     <div class="details-box">
    <h3>Lyrics</h3>
      <div v-if="songLyrics.length !== 0">
        <p>{{ songLyrics }}</p>
      </div>
      <p v-else>*No lyrics were added to this song*</p>
    <br>
     </div>

      <div class="details-box">
    <h3>Links</h3>
      <ul>
        <li v-for="songLink in songLinks">
          {{ songLink }}
        </li>
      </ul>
      </div>

    <br>

     <div class="details-box">
    <h3>Files</h3>
    <ul>
      <li v-for="file in songFiles">
        <p>{{ file.instrument }}: <em>{{ file.filepath.split("/")[1].split("-")[1] }}</em></p>
        <button @click="download(file)" class="btn-secondary">Download</button>
      </li>
    </ul>
    </div>

    <button @click="editSong" class="btn-primary">Edit</button>
    <!-- <NavigationBarBottom></NavigationBarBottom> -->
     <MobileNavBar></MobileNavBar> 
</template>

<style scoped>

</style>
