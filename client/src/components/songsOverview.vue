<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Song } from '../models/Song';
import api from '../services/api';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';
import MobileNavBar from './elements/Mobile-Navigation-Bar.vue';
import SearchBar from './elements/Search-Bar.vue';
import SortAction from './elements/Sort-Action.vue';

import '/src/stylesheets/list.css';
import '/src/stylesheets/input.css';
import '/src/stylesheets/header.css';
import '/src/stylesheets/search.css';
import MobileHeader from "./elements/Mobile-Header.vue";

const router = useRouter();

const SONG_API = 'songs';
const songs = ref<Song[]>([]);

async function loadSongs(): Promise<void> {
  try {
    const response = await api.get(SONG_API);
    songs.value = response.data;
    filteredSongs.value = songs.value;
    onSortingChanged('newest');
  } catch (error) {
    console.log(error);
  }
}
function createNewSong(): void {
  router.push('/create-song');
}
function viewSong(songId: any): void {
  console.log(songId);
  router.push({ name: 'viewsong', params: { id: songId } });
}

const filteredSongs = ref<Song[]>(songs.value);
function onSearchChange(query: string): void {
  filteredSongs.value = songs.value.filter(
    (song) =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())
  );
  onSortingChanged(currentSort.value);
}
const currentSort = ref<string>('asc');
function onSortingChanged(sort: string): void {
  currentSort.value = sort;
  const sortedSongs = [...filteredSongs.value];

  switch (sort) {
    case 'asc':
      sortedSongs.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'desc':
      sortedSongs.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'oldest':
      sortedSongs.sort(
        (a, b) =>
          new Date(a.creationDate).getTime() -
          new Date(b.creationDate).getTime()
      );
      break;
    case 'newest':
      sortedSongs.sort(
        (a, b) =>
          new Date(b.creationDate).getTime() -
          new Date(a.creationDate).getTime()
      );
      break;
    default:
      //Sollts an error geben sortier i alphabetisch, bitte ändern wenns ned passt
      sortedSongs.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }

  filteredSongs.value = sortedSongs;
}

onMounted(() => loadSongs());
</script>

<template>
  <mobile-header>
    <button @click="createNewSong" class="btn-small">+ Add</button>
  </mobile-header>
  <h1 class="section-heading">Songs</h1>
  <div class="mobile-container">
    <div>
      <SearchBar @search-change="onSearchChange"></SearchBar>
      <SortAction
        @sort-change="onSortingChanged"
        :sort-options="[
          { value: 'newest', display: 'Newest' },
          { value: 'oldest', display: 'Oldest' },
          { value: 'asc', display: 'A-Z' },
          { value: 'desc', display: 'Z-A' },
        ]"
      ></SortAction>
    </div>

    <div v-if="filteredSongs.length !== 0" class="flex">
      <span v-for="song in filteredSongs">
        <button @click="viewSong(song._id)" class="list">
          {{ song.artist }} - {{ song.title }}
        </button>
        <!-- <button @click="editSong(song._id)">Edit song</button> -->
      </span>
    </div>
    <p v-else>No songs yet</p>
  </div>
  <!-- <NavigationBarBottom></NavigationBarBottom> -->
  <!-- <MobileNavBar></MobileNavBar> -->
</template>

<style scoped></style>
