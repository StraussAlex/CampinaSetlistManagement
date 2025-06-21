<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { Song, SongFile } from '../models/Song';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';

import '/src/stylesheets/input.css';
import '/src/stylesheets/header.css';
import '/src/stylesheets/search.css';

import YesNoOverlay from './elements/YesNo-Overlay.vue';
import ErrorView from './elements/Error-View.vue';
import MobileHeader from "./elements/Mobile-Header.vue";

import {useWindowSize} from "@vueuse/core";
const { width } = useWindowSize()
const SONG_API = 'songs';

const songTitle = ref<string>('');
const songArtist = ref<string>('');
const currentNotes = ref<string>('');

const songLinks = ref<string[]>([]);
const currentLink = ref<string>('');
const files = ref<SongFile[]>([]);
const newInstrumentName = ref<string>('');

const overlayActive = ref<boolean>(false);
const overlayYesHandler = ref<() => void>(() => {});
const overlayText = ref<string>('');

const songLyrics = ref<string>('');

const errors = ref<string[]>([]);

const router = useRouter();
const route = useRoute();
const editingId = route.params.id;


const buttonText = ref<string>(
  isEditingRoute() ? 'Update Song' : 'Create Song'
);
function isEditingRoute(): boolean {
  return route.name == 'edit-song';
}

onMounted(async () => {
  if (isEditingRoute()) {
    try {
      const response = await api.get(`${SONG_API}/${editingId}`);
      const song = response.data;
      songTitle.value = song.title;
      songArtist.value = song.artist;
      songLyrics.value = song.lyrics;
      currentNotes.value = song.notes;
      songLinks.value = song.links;
      files.value = song.files;

      nextTick(() => {
        resizeLyrics();
        resizeNotes();
      });

      /*
      for (const file of song.files) {
        instruments.value.push(file.instrument);
      }
      */
    } catch (error) {
      errors.value.push('Failed to load song');
    }
  }
});
async function deleteSong(): Promise<void> {
  if (!isEditingRoute()) return;

  try {
    await api.delete(`${SONG_API}/${editingId}`);
    router.push('/songs');
  } catch (error) {
    errors.value.push('Error deleting song: ' + error);
  }
}
function insertLink(): void {
  currentLink.value = currentLink.value.trim();
  if (currentLink.value.length === 0) return;

  songLinks.value.push(currentLink.value);
  currentLink.value = '';
}
function deleteLink(index: number): void {
  songLinks.value.splice(index, 1);
}
function clearErrors(): void {
  errors.value = [];
}

async function createNewSong(): Promise<void> {
  clearErrors();
  songTitle.value = songTitle.value.trim();
  songArtist.value = songArtist.value.trim();

  if (songTitle.value.length === 0)
    errors.value.push('Song title cannot be empty');
  if (songArtist.value.length === 0)
    errors.value.push('Song artist cannot be empty');

  //console.log("instrument verification");
  for (const file of files.value) {
    if (file.filepath === 'None') {
      const target = document.getElementById(
        file.instrument
      ) as HTMLInputElement;
      //console.log(target.files);
      if (target.files === null) {
        errors.value.push(target.name + ' file cannot be empty');
      }
    }
  }

  if (errors.value.length > 0) return;

  songLinks.value = songLinks.value.filter((link: string) => link.trim().length > 0);

  const creationDate: string = new Date().toISOString();
  const song = new Song(
    songTitle.value,
    songArtist.value,
    songLyrics.value,
    currentNotes.value,
    songLinks.value,
    [],
    creationDate
  );

  try {
    const formData = new FormData();
    for (const file of files.value) {
      const target = document.getElementById(
        file.instrument
      ) as HTMLInputElement;

      if (target.files![0]) {
        formData.append(file.instrument, target.files![0]);
        if (file.filepath !== 'None') {
          const filename = file.filepath.split('/')[1];
          await api.delete(`${SONG_API}/file/${filename}`);
        }
      } else if (file.filepath !== 'None') {
        song.files.push(file);
      }
    }
    console.log(formData);
    if (!formData.entries().next().done) {
      const fileResponse = await api.post(SONG_API + '/upload', formData);

      for (const file of files.value) {
        const songFile = new SongFile(
          file.instrument,
          fileResponse.data[0].path
        );
        song.files.push(songFile);
      }
    }

    try {
      if (isEditingRoute()) {
        await api.put(`${SONG_API}/${editingId}`, song);
      } else {
        const response = await api.post(SONG_API, song);
        song._id = response.data.insertedId;
      }
      router.push(isEditingRoute() ? `/songs/${editingId}` : '/songs');
    } catch (error) {
      errors.value.push('Error creating an event: ' + error);
    }
  } catch (error) {
    errors.value.push('Error saving song: ' + error);
  }
}

function addInstrumentInput(): void {
  if (newInstrumentName.value !== '') {
    const song = new SongFile(newInstrumentName.value, 'None');
    files.value.push(song);
    newInstrumentName.value = '';
  }
}
async function deleteInstrument(index: number) {
  const filename = files.value[index].filepath.split('/')[1];
  await api.delete(`${SONG_API}/file/${filename}`);
  files.value.splice(index, 1);
}
function activateOverlay(handler: any, text: string) {
  overlayYesHandler.value = handler;
  overlayText.value = text;
  overlayActive.value = true;
}

const lyricsTextarea = ref<HTMLTextAreaElement | null>(null);
function resizeLyrics(): void {
  const textarea = lyricsTextarea.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
const notesTextarea = ref<HTMLTextAreaElement | null>(null);
function resizeNotes(): void {
  const textarea = notesTextarea.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}
function getDomainName(url: string): string {

  //Wenn wer will kann wer vlt youtube oder spotify einzeln abfangen oder so
  
  try {
    const obj: URL = new URL(url);
    return obj.hostname;
  } catch(error) {
    return url;
  }
}
function geniusQuery(){
  api.get('/api/genius/lyrics', {
    params: {
      song: songTitle.value,
      artist: songArtist.value
    }
  }).then(res => {
    const link = document.createElement('a');
    link.href = res.data.url;
    link.target = '_blank'; // Open in new tab/window
    link.rel = 'noopener noreferrer'; // Recommended for security
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up
    console.log(res.data.url); // Genius lyrics page URL
  }).catch(err => {
    console.error(err.response?.data || 'Error fetching lyrics');
  });
}

</script>

<template>
  <mobile-header v-if="width < 600">
    <button
        v-if="isEditingRoute()"
        @click="activateOverlay(deleteSong, 'Are you sure you want to delete this Song?')"
        class="btn-caution btn-small">Delete</button>
  </mobile-header>
  <h1 class="section-heading">{{ buttonText }}</h1>
  <button
      v-if="isEditingRoute() && width > 600"
      @click="activateOverlay(deleteSong, 'Are you sure you want to delete this Song?')"
      class="btn-caution btn-small btn-inline-sectionheading">Delete</button>

  <ErrorView :errors="errors"></ErrorView>
  <div class="content-container">
    <div class="content-block">
      <div class="details-box bottom-line">
        <div class=" labeled-input">
          <label for="input-song-name">Song Name</label>
          <input name="input-song-name" v-model="songTitle" placeholder="Song Name" />
        </div>
      </div>
      <div class="details-box bottom-line">
        <div class=" labeled-input">
          <label for="input-song-artist">Artist</label>
          <input name="input-song-artist" v-model="songArtist" placeholder="Artist Name" />
        </div>
      </div>
      <div class="details-box bottom-line">
        <h2>Links</h2>
        <div v-if="songLinks.length > 0">
          <div v-for="(link, index) in songLinks" class="list">
            <a :href="link">{{ getDomainName(link) }}</a>
            <button @click="deleteLink(index)" class="btn-caution btn-square">X</button>
          </div>
        </div>
        <p v-else>This song has no links yet</p>
        <br>

        <div class="labeled-input">
          <label for="input-song-link">Add link</label>
          <input name="input-song-link" v-model="currentLink" />
        </div>
        <button @click="insertLink" class="btn-secondary btn-small">
          + Add link
        </button>
      </div>
      <div class="details-box bottom-line">
        <div class=" labeled-input">
          <label for="input-song-notes">Additional notes</label>
          <textarea @input="resizeNotes" ref="notesTextarea" name="input-song-notes" v-model="currentNotes" placeholder="Who sings, who plays drums, which tuning, how well did practise go etc..." ></textarea>
        </div>
      </div>
    </div>
    <span v-if="width > 600" class="vertical-divider"></span>
    <div class="content-block">
      <div class="details-box bottom-line">
        <div class="labeled-input">
          <label for="input-song-lyrics">Lyrics</label>
          <textarea @input="resizeLyrics" ref="lyricsTextarea" name="input-song-lyrics" v-model="songLyrics" placeholder="Insert Lyrics or leave empty to automatically fill"></textarea>
        </div>
        <button @click="geniusQuery" class="btn-secondary btn-small">Search Genius Lyrics</button>
      </div>
    </div>
    <span v-if="width > 600" class="vertical-divider"></span>
    <div class="content-block">
      <div class="details-box">
        <div class="labeled-input">
          <label for="input-instrument">Add New Instrument</label>
          <input name="input-instrument" v-model="newInstrumentName" />
        </div>
        <button @click="addInstrumentInput" class="btn-secondary btn-small">
          + Add Instrument
        </button>
      </div>

      <div class="details-box bottom-line" v-for="(file, index) in files">
        <h3 v-if="file.filepath === 'None'">{{ file.instrument }}: No File</h3>
        <h3 v-else>{{ file.instrument }}: {{ file.filepath.split("/")[1].split("-")[1] }}</h3>
        <div>
          <input type="file" :id="file.instrument" :name="file.instrument" />
          <button @click="deleteInstrument(index)">X</button>
        </div>

      </div>
    </div>
  </div>
  <button
      @click="
      activateOverlay(
        createNewSong,
        `Are you sure you want to ${buttonText.split(' ')[0]} this Song?`
      )"
      class="btn-primary"
  >
    {{ buttonText }}
  </button>
  <button @click="
      activateOverlay(
        router.back,
        `Are you sure you want to discard your changes and leave.`
      )" class="btn-caution">Discard and return</button>
  <YesNoOverlay
    v-model="overlayActive"
    :text="overlayText"
    @yes="overlayYesHandler"
  ></YesNoOverlay>
</template>

<style scoped>

textarea {
  resize: none;
  height: auto;
}

</style>
