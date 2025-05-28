<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import {onMounted, ref} from "vue";
import api from "../../services/api.ts";
const router = useRouter();
const route = useRoute();

function displayNav():boolean{
  switch (route.name) {
    case "login":
      return false;
    case "landing-page":
      return false;
    case "not-found-page":
      return false;
  }
  return true;
}
function navigateTo(path: string): void {
  router.push(path);
}

const user = ref<any|null>(null);

async function logoutUser()  {
  try {
    const response = await api.post('/login/logout', {}, { withCredentials: true })
    console.log(response.data.message)
    router.push('/')
  } catch (error: any) {
    console.error('Logout failed', error.response?.data)
  }
}

onMounted(async() => {
  const response = await api.get('/auth', { withCredentials: true });
  user.value  = response.data.user;
  console.log(user);
});
</script>

<template>
  <header>
    <img @click="navigateTo('/')" src="../../assets/Logo.png" alt="Logo displaying a stylized version of the mos eisley cantina band alien from star wars"/>
    <nav v-if="displayNav()">
      <span @click="navigateTo('/events')"  :class="{ active: route.name === 'events' }">
        HOME
      </span>
      <span @click="navigateTo('/setlists')"  :class="{ active: route.name === 'setlists' }">
        SETLIST
      </span>
      <span @click="navigateTo('/songs')"  :class="{ active: route.name === 'songs' }">
        SONGS
      </span>
      <span @click="navigateTo('/manage-users')"  :class="{ active: route.name === 'admin-page' }">
        ADMIN
      </span>
      <span @click="logoutUser()">
        LOGOUT
      </span>
    </nav>
    <div v-else>
      <button v-if="route.name !== 'not-found-page'" @click="navigateTo('/login')" class="btn-empty">Log In</button>
    </div>
  </header>
</template>

<style scoped>

  img{
    cursor: pointer;
  }
  header{
    height: 110px;
    padding: 15px 6vw;
    width: 100vw;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--primary);
    position: fixed;
    top: 0;
    background-color: var(--secondary-lighter);
  }
  nav {
    min-width: 420px;
    max-width: 40vw;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  nav > span {
    font-size: 20px;
    font-weight: 500;
  }
  nav > span:hover {
    cursor: pointer;
    color: var(--primary-lighter);
  }
  nav > span.active {
    color: var(--background);
  }
  div {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  @media only screen and (max-width: 600px) {
    header {
      display: none;
    }
  }
</style>