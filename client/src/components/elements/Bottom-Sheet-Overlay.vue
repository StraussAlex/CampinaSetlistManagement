<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import "../../stylesheets/bottom-sheet-overlay.css";
import type { Song } from "../../models/Song";
import api from "../../services/api";
import SearchBar from './Search-Bar.vue';

import { defineEmits } from 'vue'
const emit = defineEmits<{
  (e: 'add-song', song: Song): void
}>()

interface Props {
  setlistSongs : Song[]
}

const props = defineProps<Props>();

const bottomSheet = ref<HTMLDivElement | null>(null);
const sheetOverlay = ref<HTMLDivElement | null>(null);
const sheetContent = ref<HTMLDivElement | null>(null);
const dragIcon = ref<HTMLDivElement | null>(null);

let isDragging = false;
let startY = 0;
let startHeight = 0;

const SONG_API = "songs";
const songs = ref<Song[]>([]);
// const availableSongs = ref<Song[]>([]);
const currentQuery = ref<string>("");
const errors = ref<string[]>([]);
watch(props, () => {
  onSearchChange(currentQuery.value);
  filteredSongs.value = songs.value.filter(song => !songAlreadyInSetlist(song));
})

async function loadSongs(): Promise<void> {
  try {
    const response = await api.get(SONG_API);
    songs.value = response.data;
    // filteredSongs.value = songs.value;
    // onSortingChanged('newest');
    filteredSongs.value = response.data;

  } catch(error) {
    errors.value.push("Error loading songs: " + error);
  }
}

function songAlreadyInSetlist(song: Song): boolean {
  for(let i: number = 0; i < props.setlistSongs.length; i++) {
    if(props.setlistSongs[i]._id == song._id) return true;
  }
  return false;
}
const filteredSongs = ref<Song[]>(songs.value);
function onSearchChange(query: string): void {
  currentQuery.value = query;
  filteredSongs.value = songs.value.filter(
    (song) =>
      (song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase())) &&
      !songAlreadyInSetlist(song)
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

const updateSheetHeight = (raw: number) => {
  if (!sheetContent.value || !bottomSheet.value || !sheetOverlay.value) return;

  const height = Math.min(Math.max(raw, 0), 100);

  bottomSheet.value.style.height  = `${height}vh`;
  sheetContent.value.style.height = `${height}vh`;

  if (isDragging) return;

  const isFull = height >= 100 - 0.01;
  bottomSheet.value.classList.toggle("fullscreen", isFull);

  if (height > 10 && !isFull) {
    sheetOverlay.value.style.pointerEvents = "auto";
    sheetOverlay.value.style.background = "rgba(0,0,0,0.5)";
  } else {
    sheetOverlay.value.style.pointerEvents = "none";
    sheetOverlay.value.style.background = "transparent";
  }
};


const setupBottomSheet = () => {
  if (!bottomSheet.value || !sheetOverlay.value) return;

  bottomSheet.value.classList.add("show", "no-transition");
  document.body.style.overflowY = "auto";

  updateSheetHeight(2);

  requestAnimationFrame(() => {
    if (!bottomSheet.value) return;
    bottomSheet.value.classList.remove("no-transition");
  });
};

const hideBottomSheet = () => {
  if (!bottomSheet.value || !sheetOverlay.value || !sheetContent.value) return;
  bottomSheet.value.classList.remove("fullscreen", "dragging");
  document.body.style.overflowY = "auto";
  sheetOverlay.value.style.background = "transparent";
  updateSheetHeight(5);
};

const dragStart = (e: MouseEvent | TouchEvent) => {
  if (!sheetContent.value || !bottomSheet.value) return;
  bottomSheet.value.classList.add("dragging");
  isDragging = true;
  startY = e instanceof TouchEvent ? e.touches[0].pageY : e.pageY;
  startHeight = parseInt(sheetContent.value.style.height || "50");
  
};

const dragging = (e: MouseEvent | TouchEvent) => {
  if (!isDragging || !sheetContent.value) return;

  const currentY = e instanceof TouchEvent ? e.touches[0].pageY : e.pageY;
  const delta = startY - currentY;
  const newHeight = startHeight + (delta / window.innerHeight) * 100;
  updateSheetHeight(newHeight);
};

const dragStop = () => {
  if (!sheetContent.value || !bottomSheet.value) return;
  isDragging = false;
  bottomSheet.value.classList.remove("dragging");

  const h = parseFloat(sheetContent.value.style.height) || 0;

  if (h < 30) {
    hideBottomSheet();
  } else if (h < 45) {
    updateSheetHeight(40);
   } else if (h < 80) {
    updateSheetHeight(75);
  } else {
    updateSheetHeight(100);
    if (!sheetOverlay.value) return;
    sheetOverlay.value.style.background = "rgba(0,0,0,0.5)";
  }
};

const openBottomSheetWithBtn = (num: number) => {
  updateSheetHeight(num);
}

onMounted(async () => {
  dragIcon.value?.addEventListener("mousedown", dragStart);
  window.addEventListener("mousemove", dragging);
  window.addEventListener("mouseup", dragStop);

  dragIcon.value?.addEventListener("touchstart", dragStart);
  window.addEventListener("touchmove", dragging);
  window.addEventListener("touchend", dragStop);

  await loadSongs();
});

defineExpose({
  setupBottomSheet,
  openBottomSheetWithBtn,
  hideBottomSheet
})

function onAddSong(song: Song): void {
  emit('add-song', song);
  onSearchChange(currentQuery.value);
  filteredSongs.value.filter(song => !songAlreadyInSetlist(song));
}
</script>

<template>
  <div>
    <div ref="bottomSheet" class="bottom-sheet">
      <div ref="sheetOverlay" class="sheet-overlay" @click="hideBottomSheet"></div>

      <div ref="sheetContent" class="content">
        <div class="header">
          <div ref="dragIcon" class="drag-icon"><span></span></div>
        </div>

        <div class="body">
          <SearchBar @search-change="onSearchChange"></SearchBar>
          <div>
              <ul id="overlay-ul" v-if="filteredSongs.length !== 0" class="flex">
                <li v-for="song in filteredSongs">
                  <button @click="onAddSong(song)" class="btn-secondary btn-small"> + </button>
                  {{ song.artist }} - {{ song.title }}
                </li>
              </ul>
            <p v-else>No songs available</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>