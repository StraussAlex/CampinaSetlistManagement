<script setup lang="ts">
import { ref } from 'vue';
import { onMounted } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';
const router = useRouter();

import 'stylesheets/input.css'

const currentUsername = ref<string>('');
const currentPassword = ref<string>('');
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
  <br />
  <button @click="loginUser">Login</button>
  <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
</template>

<style></style>
