<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import api from '../services/api'
import User from '../models/User';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';

const router = useRouter();
const USER_API = "users";

const currentUsername = ref<string>("");
const currentPassword = ref<string>("");
const currentIsAdmin = ref<boolean>(false);

const errors = ref<string[]>([]);

onMounted(() => { loadUsers() });
const users = ref<User[]>([]);
async function loadUsers(): Promise<void> {
  try {
    const response = await api.get(USER_API);
    users.value = response.data;
  } catch(error) {
    console.log(error);
  }
}

async function deleteUser(user: User): Promise<void> {
  try {
    const response = await api.delete(`${USER_API}/${user._id}`);
    await loadUsers();
  } catch(error) {
    console.log(error);
  }
}

async function createUser(): Promise<void> {
  errors.value = getUserErrors();
  if(errors.value.length > 0) return;

  currentPassword.value = currentPassword.value.trim();
  currentUsername.value = currentUsername.value.trim();

  try {
    const response = await api.get(`${USER_API}/by-name/${currentUsername.value}`);
    if(response.data.length > 0) {
      errors.value.push("User with this name already exists");
      return;
    }
  } catch(error) {
    errors.value.push("Error validating data - try again later");
    return;
  }

  const passwordHash = await User.hashPassword(currentPassword.value);
  const newUser = new User(currentUsername.value, passwordHash, currentIsAdmin.value);

  try {
    const response = await api.post(USER_API, newUser);
    newUser._id = response.data.insertedId;

    await loadUsers();
    currentIsAdmin.value = false;
    currentPassword.value = "";
    currentUsername.value = "";

  } catch(error) {
    errors.value.push("Error creating user: " + error);
  }

}
function getUserErrors(): string[] {
  const e = [];
  if(currentUsername.value.trim().length <= 0) e.push("Username cannot be empty");
  if(currentPassword.value.trim().length <= 8) e.push("Password needs at least 8 characters"); //Someone can go crazy here with requirements lmao
  return e;
}

</script>

<template>
  <h1>Manage Accounts</h1>

  <h2>Registered Users</h2>
  <ul>
    <li v-for="user in users">
      {{ user.userName }} &nbsp; Admin: {{ user.isAdmin }}
      <button @click="deleteUser(user)" class="btn-caution btn-square">X</button>
    </li>
  </ul>

  <h2>Create user</h2>
  <div class="labeled-input">
  <label for="input-username">Username</label>
  <input type="text" name="input-username" v-model="currentUsername" placeholder="Username">
</div>
<div class="labeled-input">
  <label for="input-password">Password</label>
  <input name="input-password" type="password" v-model="currentPassword" placeholder="Password"></div>
  
  <label class="checkbox-wrapper">
  <input 
    name="input-isadmin" 
    type="checkbox" 
    v-model="currentIsAdmin" 
    class="checkbox-input"
  >
  <span class="custom-checkbox"></span>
  Is Admin
</label>

  
  <button @click="createUser()" class="btn-primary">Create user</button>
  
  <ul>
    <li v-for="e in errors">{{ e }}</li>
  </ul>

  <NavigationBarBottom></NavigationBarBottom>

</template>

<style scoped>

</style>
