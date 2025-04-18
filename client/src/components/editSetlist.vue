<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import { Song } from '../models/Song'
import { Setlist, SetlistSong } from '../models/Setlist'
import api from '../services/api'

const router = useRouter();
const route = useRoute();

const SONG_API = "songs";
const songs = ref<Song[]>([]);
const SETLIST_API = "setlists/edit-setlist";
const setlistId = route.params.id;

const errors = ref<string[]>([]);

function clearErrors(): void {
  errors.value = [];
}


async function loadSongs(): Promise<void> {
  try {
    const response = await api.get(SONG_API);
    songs.value = response.data;
  } catch(error) {
    console.log(error);
  }
}

const newSetlistName = ref<string>('');
const newSetlistSongs = ref<Song[]>([]);


onMounted(async () => {
  await loadSongs()

  try {
    const response = await api.get(`${SETLIST_API}/${setlistId}`)
    const setlist = response.data

    newSetlistName.value = setlist.name

    const fullSongs = songs.value.filter(song =>
      setlist.songs.some((s: SetlistSong) => s.songId === song._id)
    )

    newSetlistSongs.value = fullSongs

  } catch (error) {
    console.log(error)
    errors.value.push("Failed to load setlist.")
  }
})


onMounted(() => loadSongs());


function removeSong(index: number): void {
  newSetlistSongs.value.splice(index, 1);
}
function addSongToSetlist(song: Song) {
  if(songAlreadyInSetlist(song)) return;
  newSetlistSongs.value.push(song);
}
function songAlreadyInSetlist(song: Song): boolean {
  for(let i: number = 0; i < newSetlistSongs.value.length; i++) {
    if(newSetlistSongs.value[i]._id == song._id) return true;
  }
  return false;
}

async function updateSetlist(): Promise<void> {
  clearErrors();

  if(newSetlistName.value.length === 0) errors.value.push("Setlist name cannot be empty");
  
  if(errors.value.length > 0) return;

  let songList: SetlistSong[] = [];
  for(let i: number = 0; i < newSetlistSongs.value.length; i++) {
    const entry = new SetlistSong(newSetlistSongs.value[i]._id, i + 1);
    songList.push(entry);
  }
  const updatedSetlist: Setlist = {
    _id: setlistId,
    name: newSetlistName.value,
    songs: songList};

  try {
    await api.put(`${SETLIST_API}/${setlistId}`, updatedSetlist);
    router.push("/setlists");

  } catch(error) {
    errors.value.push("Error saving setlist: " + error);
  }
}

</script>

<template>
  <h1>Edit Setlist</h1>

  <label for="input-setlist-name">Setlist Name</label>
  <input name="input-setlist-name" v-model="newSetlistName">

  <p>Setlist</p>
  <div>
    <ul v-if="newSetlistSongs.length !== 0">
      <li v-for="(song, index) in newSetlistSongs">{{ song.artist }} - {{ song.title }}
        <button @click="removeSong(index)">X</button>
      </li>
    </ul>
    <p v-else>Empty setlist</p>
  </div>

  <hr>

  <p>Song selection</p>
  <div>
    <ul v-if="songs.length !== 0">
      <li v-for="song in songs">{{ song.artist }} - {{ song.title }}
        <button @click="addSongToSetlist(song)">Add song</button>
      </li>
    </ul>
    <p v-else>No songs available</p>
  </div>

  <ul>
    <li v-for="error in errors">{{ error }}</li>
  </ul>

  <button @click="updateSetlist">Save setlist</button>
</template>

<style scoped>

</style>
