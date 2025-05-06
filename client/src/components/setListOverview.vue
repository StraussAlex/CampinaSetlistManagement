<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { Setlist } from '../models/Setlist';
import api from '../services/api'
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';

import SortAction from './elements/Sort-Action.vue';
import SearchBar from './elements/Search-Bar.vue';

import '/src/stylesheets/list.css'
import '/src/stylesheets/input.css'
import '/src/stylesheets/header.css'
import '/src/stylesheets/search.css'

const router = useRouter();

const SETLIST_API = "setlists";
const setlists = ref<Setlist[]>([]);

async function loadSetlists(): Promise<void> {
  try {
    const response = await api.get(SETLIST_API);
    setlists.value = response.data;

    filteredSetlists.value = setlists.value;
    onSortingChanged('newest');
  } catch(error) {
    console.log(error);
  }
}
function viewSetlist(setlistId: any): void {
  router.push({ name: 'viewsetlist', params: { id: setlistId } });
}
function createNewSetlist(): void {
  router.push("/create-setlist");
}
onMounted(() => loadSetlists());

const filteredSetlists = ref<Setlist[]>(setlists.value);
function onSearchChange(query: string): void {
  filteredSetlists.value = setlists.value.filter(list =>
    list.name.toLowerCase().includes(query.toLowerCase()));
  onSortingChanged(currentSort.value);
}
const currentSort = ref<string>('asc');
function onSortingChanged(sort: string): void {
  currentSort.value = sort;
  const sortedSetlists = [...filteredSetlists.value];
  
  switch(sort) {
      case 'asc':
        sortedSetlists.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'desc':
        sortedSetlists.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'oldest':
        sortedSetlists.sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());
        break;
      case 'newest':
        sortedSetlists.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        break;
      default:
        //Sollts an error geben sortier i nach neuestem, bitte ändern wenns ned passt
        sortedSetlists.sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        break;
  }

  filteredSetlists.value = sortedSetlists;
}

</script>

<template>
  <h1>Setlists</h1>

  <div>
    <SearchBar @search-change="onSearchChange"></SearchBar>
    <SortAction @sort-change="onSortingChanged" :sort-options="[
      {value: 'newest', display: 'Newest'},
      {value: 'oldest', display: 'Oldest'},
      {value: 'asc', display: 'A-Z'},
      {value: 'desc', display: 'Z-A'}
    ]"></SortAction>
  </div>

  <ul v-if="filteredSetlists.length !== 0">
    <li v-for="setlist in filteredSetlists">{{ setlist.name }} | {{ setlist.songs.length }} song(s)
      <button @click="viewSetlist(setlist._id)">View setlist</button>
      <!-- <button @click="editSetlist(setlist._id)">Edit setlist</button>  -->
    </li>
  </ul>
  <p v-else>No setlists yet</p>

  <button @click="createNewSetlist">Create new setlist</button>

  <NavigationBarBottom></NavigationBarBottom>
</template>

<style scoped>

</style>
