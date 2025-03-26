<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { Setlist } from '../models/Setlist';
import api from '../services/api'

const router = useRouter();

const SETLIST_API = "setlists";
const setlists = ref<Setlist[]>([]);

async function loadSetlists(): Promise<void> {
  try {
    const response = await api.get(SETLIST_API);
    setlists.value = response.data;
  } catch(error) {
    console.log(error);
  }
}
function createNewSetlist(): void {
  //TODO: reroute to setlist creation page
  // router.push("/");
}
onMounted(() => loadSetlists());

</script>

<template>
  <h1>Setlists</h1>
  <ul v-if="setlists.length !== 0">
    <li v-for="setlist in setlists">{{ setlist.name }} | {{ setlist.songs.length }} song(s)
      <button>View setlist</button>
    </li>
  </ul>
  <p v-else>No setlists yet</p>

  <button @click="createNewSetlist">Create new setlist</button>
</template>

<style scoped>

</style>
