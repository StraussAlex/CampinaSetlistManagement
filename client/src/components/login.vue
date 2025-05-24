<script setup lang="ts">
import { ref } from 'vue';
import { onMounted } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';
const router = useRouter();

import '/src/stylesheets/input.css'
import MobileHeader from "./elements/Mobile-Header.vue";

const currentUsername = ref<string>('admin');
const currentPassword = ref<string>('password123');
const errorMessage = ref<string>('');

// ! AUTO ADMIN CREATION - DELETE BEFORE PRODUCTION
onMounted(async () => {
  try {
    await api.get('/login/ensure-admin');
    console.log('Default data check complete');
  } catch (err) {
    console.error('Error ensuring default data', err);
  }
});
// ! END OF "TO DELETE"

async function loginUser(): Promise<void> {
  try {
    const response = await api.post(
      '/login',
      { username: currentUsername.value, password: currentPassword.value },
      {
        withCredentials: true,
      }
    );
    console.log('Login successful', response.data);
    router.push('/events');
  } catch (error: any) {
    console.error('Login failed', error.response?.data);
    errorMessage.value = error.response?.data || 'Login failed.';
  }
}
</script>

<template>
  <div class="app">
  <div class="header-wrapper">
    <mobile-header></mobile-header>
  </div>
  <div class = "shadow-wrapper">
  <div id="login-centering" class="flex">
    <div>
      <h1>Login</h1>
      <label for="username">
        Username
        <input
            type="text"
            name="username"
            v-model="currentUsername"
            placeholder="admin"
        />
      </label>
      <br />
      <label for="password">
        Password
        <input
            type="password"
            name="password"
            v-model="currentPassword"
            placeholder="password123"
        />
      </label>
        <br/>
        <button @click="loginUser" class="btn-primary">Log In</button>
      </div>
    </div>
  </div>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<style>
  #login-centering{
    height: 70vh;
    justify-content: space-around;
  }

  .section-heading{
    background: none;
  }
  .app {
    background-image: url("../assets/Icons/landingPageBackground.jpg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: left;
    background-position-y: bottom;
    overflow-x: hidden;
    position: fixed;
    min-height: 100vh; 
    width: 100%;
  }

  .shadow-wrapper{
    background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--background) 100%, transparent) 0%,
    color-mix(in srgb, var(--background) 98%, transparent) 10%,
    color-mix(in srgb, var(--background) 96%, transparent) 20%,
    color-mix(in srgb, var(--background) 93%, transparent) 30%,
    color-mix(in srgb, var(--background) 88%, transparent) 40%,
    color-mix(in srgb, var(--background) 80%, transparent) 50%,
    color-mix(in srgb, var(--background) 70%, transparent) 60%,
    color-mix(in srgb, var(--background) 60%, transparent) 70%,
    color-mix(in srgb, var(--background) 40%, transparent) 80%,
    color-mix(in srgb, var(--background) 20%, transparent) 90%,
    color-mix(in srgb, var(--background) 0%, transparent) 100%
  );
    padding-bottom: 300px;
  }

  .h1,h2,p{
    text-shadow: var(--background) 2px 2px 20px;
  }

  .header-wrapper{
    background-color: var(--background);
  }
</style>
