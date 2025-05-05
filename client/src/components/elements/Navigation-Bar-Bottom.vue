<script setup lang="ts">
import { onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router';
import api from '../../services/api'

import 'stylesheets/nav.css';

    const router = useRouter();

    function navigateTo(path: string): void {
        router.push(path);
    }
    async function logoutUser()  {
  try {
    const response = await api.post('/login/logout', {}, { withCredentials: true })
    console.log(response.data.message)
    router.push('/')
  } catch (error: any) {
    console.error('Logout failed', error.response?.data)
  }
}
const user = ref<any|null>(null);

// retrieving SessionInformation from Backend
onMounted(() => {
    async function checkAuth() {
        const response = await api.get('/auth', { withCredentials: true });
        user.value  = response.data.user;
        console.log(user);
        
    }
    checkAuth();
}) 



</script>
<template>
    <div class="navigation-bar-bottom">
        <button @click="navigateTo('/events')">Events</button>
        <button @click="navigateTo('/setlists')">Setlists</button>
        <button @click="navigateTo('/songs')">Songs</button>
        <!-- only show this button if logged in as admin -->
        <button v-if="user !== null && user.isAdmin" @click="navigateTo('/manage-users')">Users</button>
        <button @click="logoutUser()">Logout</button> 
    </div>
</template>

<style scoped>

    .navigation-bar-bottom {
        display: flex;
        align-items: center;
        flex-direction: row;
        justify-content: center;
        gap: 10px;

        width: 100%;
        position: fixed;
        bottom: 0;
        left: 0;

        padding: 20px;
        background-color: #1e1e1e;
    }

</style>