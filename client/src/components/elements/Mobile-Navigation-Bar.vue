<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import api from '../../services/api'
import '/src/stylesheets/nav.css';

const router = useRouter();
const route = useRoute();

function navigateTo(path: string): void {
  router.push(path);
}

const user = ref<any|null>(null);

async function logoutUser()  {
  try {
    const response = await api.post('/login/logout', {}, { withCredentials: true })
    //console.log(response.data.message)
    router.push('/')
  } catch (error: any) {
    console.error('Logout failed', error.response?.data)
  }
}

onMounted(async() => {
    const response = await api.get('/auth', { withCredentials: true });
    user.value  = response.data.user;
    //console.log(user);
});

</script>

<template>

  <div class="mobile-navigation-bar">
    <div 
      class="icon-container" 
      @click="navigateTo('/events')" 
      :class="{ active: route.name === 'events' }"
    >
      <img src="../../assets/Icons/HomeClicked.png" alt = "Events"/>
      <div class="ani_square"></div>
    </div>

    <div 
      class="icon-container" 
      @click="navigateTo('/setlists')" 
      :class="{ active: route.name === 'setlists' }"
    >
      <img class="icon unclicked" src="../../assets/Icons/SetlistClicked.png" alt = "Setlists"/>
      <div class="ani_square"></div>
    </div>

    <div 
      class="icon-container" 
      @click="navigateTo('/songs')" 
      :class="{ active: route.name === 'songs' }"
    >
      <img class="tracks" src="../../assets/Icons/SongsClicked.png" alt = "Songs"/>
      <div class="ani_square"></div>
    </div>

    <div 
      class="icon-container" 
      v-if="user !== null && user.isAdmin" 
      @click="navigateTo('/manage-users')" 
      :class="{ active: route.name === 'admin-page' }"
    >
      <img class="users" src="../../assets/Icons/SettingsClicked.png" alt = "Settings"/>
      <div class="ani_square"></div>
    </div>

    <div 
      class="icon-container" 
      @click="logoutUser()">
      <img class="logout" src="../../assets/Icons/LogOutHover.png" alt = "Logout"/>
      <div class="ani_square"></div>
    </div>
  </div>

</template>

<style scoped>
  .logout{
    height: 31px;
    width: 32px;
  }
</style>
