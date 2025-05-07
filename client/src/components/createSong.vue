<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Song, SongFile} from '../models/Song'
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api'
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';

import '/src/stylesheets/input.css'
import '/src/stylesheets/header.css'
import '/src/stylesheets/search.css'
import '/src/stylesheets/overlay.css'

const SONG_API = "songs";

const songTitle = ref<string>("");
const songArtist = ref<string>("");
const currentNotes = ref<string>("");

const songLinks = ref<string[]>([]);
const currentLink = ref<string>("");
const files = ref<SongFile[]>([]);
const newInstrumentName = ref<string>("");
//const files = ref<File[]>([]);

const songLyrics = ref<string>("");

const errors = ref<string[]>([]);

const router = useRouter();
const route = useRoute();
const editingId = route.params.id;

const buttonText = ref<string>(isEditingRoute() ? "Update Song" : "Create Song");
function isEditingRoute(): boolean {
  return route.name == "edit-song";
}

onMounted(async () => {
  if(isEditingRoute()) {
    try {
      const response = await api.get(`${SONG_API}/${editingId}`)
      const song = response.data
      songTitle.value = song.title;
      songArtist.value = song.artist;
      songLinks.value = song.links;
      files.value = song.files;

      /*
      for (const file of song.files) {
        instruments.value.push(file.instrument);
      }
      */
    } catch (error) {
      errors.value.push('Failed to load song')
    }
  }
})

function insertLink(): void {
  currentLink.value = currentLink.value.trim();
  if(currentLink.value.length === 0) return;

  songLinks.value.push(currentLink.value);
  currentLink.value = "";
}
function deleteLink(index: number): void {
  songLinks.value.splice(index, 1);
}
function clearErrors(): void {
  errors.value = [];
}

async function createNewSong(): Promise<void> {

  //TODO add validation and save errors to errors
  clearErrors();
  songTitle.value = songTitle.value.trim();
  songArtist.value = songArtist.value.trim();

  if(songTitle.value.length === 0) errors.value.push("Song title cannot be empty");
  if(songArtist.value.length === 0) errors.value.push("Song artist cannot be empty");

  //console.log("instrument verification");
  for (const file of files.value) {
    if (file.filepath === "None"){
      const target = document.getElementById(file.instrument) as HTMLInputElement;
      //console.log(target.files);
      if (target.files === null){
        errors.value.push(target.name + " file cannot be empty")
      }
    }
  }

  if(errors.value.length > 0) return;

  //! WICHTIG: Siehe createEvent und createSetlist, sollte es eine editingRoute sein (mithilfe von Funktion abfragen), das alte creationDate laden und
  //! wie in den anderen beiden create files zwischenspeichern. In der nächsten Zeile basierend auf isEditingRoute entscheiden, ob neues oder bestehendes
  //! creation Date genommen wird

  //! Eigentlich auch gar nicht nötig, da in der express put route kein set feld fürs creation date existiert. Trotzdem zur sicherheit vorher abfragen?
  const creationDate: string = new Date().toISOString();
  const song = new Song(songTitle.value, songArtist.value, songLyrics.value, currentNotes.value, songLinks.value, [], creationDate);

  try {
    const formData = new FormData();
    for (const file of files.value) {
      const target = document.getElementById(file.instrument) as HTMLInputElement

      if (target.files[0]){
        formData.append(file.instrument, target.files![0]);
        if (file.filepath !== "None"){
          const filename = file.filepath.split("/")[1]
          await api.delete(`${SONG_API}/file/${filename}`);
        }
      }else if(file.filepath !== "None"){
        song.files.push(file)
      }
    }
    console.log(formData)
    if (!formData.entries().next().done){
      const fileResponse = await api.post(SONG_API + "/upload", formData);

      for (const file of files.value) {
        const songFile = new SongFile(file.instrument, fileResponse.data[0].path);
        song.files.push(songFile);
      }
    }


    try {
      if(isEditingRoute()) {
        await api.put(`${SONG_API}/${editingId}`, song);
      } else {
        const response = await api.post(SONG_API, song);
        song._id = response.data.insertedId;
      }
      router.push("/events")
    } catch(error) {
      errors.value.push("Error creating an event: " + error)
    }

  } catch(error) {
    errors.value.push("Error saving song: " + error);
  }
}


function addInstrumentInput(): void{
  if (newInstrumentName.value !== ""){
    const song = new SongFile(newInstrumentName.value, "None")
    files.value.push(song);
    newInstrumentName.value = "";
  }
}
async function deleteInstrument(index: number) {
  const filename = files.value[index].filepath.split("/")[1]
  await api.delete(`${SONG_API}/file/${filename}`);
  files.value.splice(index, 1)
}

</script>

<template>
  <h1>Create Song</h1>

  <label for="input-song-name">Song Name</label>
  <input name="input-song-name" v-model="songTitle">

  <br><br>

  <label for="input-song-artist">Artist</label>
  <input name="input-song-artist" v-model="songArtist">

  <br><br>

  <label for="input-song-notes">Additional notes</label>
  <textarea name="input-song-notes" v-model="currentNotes"></textarea>

  <h2>Links</h2>
  <ul>
    <li v-for="(link, index) in songLinks">{{ link }} <button @click="deleteLink(index)" class="btn-caution btn-square">X</button></li>
  </ul>

  <label for="input-song-link">Add link</label> 
  <input name="input-song-link" v-model="currentLink">
  <button @click="insertLink" class="btn-secondary btn-small">+ Add link</button>

  <h2>Lyrics</h2>

  <label for="input-song-lyrics">Lyrics</label>
  <textarea name="input-song-lyrics" v-model="songLyrics"></textarea>
  <p>Insert song lyrics here. If left empty, try to fetch lyrics from external resource?</p>

  <div>
    <input type="text" v-model="newInstrumentName">
    <button @click="addInstrumentInput" class="btn-secondary btn-small"> + Add Instrument</button>

    <div v-for="(file, index) in files">
      <button @click="deleteInstrument(index)">X</button>
      <label>{{ file.instrument }}</label>
      <label v-if='file.filepath==="None"'>File: None</label>
      <label v-else>File: {{ file.filepath.split("/")[1].split("-")[1] }}</label>
      <input type="file" :id="file.instrument" :name="file.instrument">
    </div>
  </div>




  <ul>
    <li v-for="error in errors">{{ error }}</li>
  </ul>

  <button @click="createNewSong" class="btn-primary">{{ buttonText }}</button>

  <!-- <p>TODO: Add the option to add different files and assign them to instruments</p> -->
  <NavigationBarBottom></NavigationBarBottom>
</template>

<style scoped>


</style>
