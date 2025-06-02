<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import User from '../models/User';
import MobileHeader from "./elements/Mobile-Header.vue";
import ErrorView from './elements/Error-View.vue';
import YesNoOverlay from "./elements/YesNo-Overlay.vue";
import {useWindowSize} from "@vueuse/core";

const { width } = useWindowSize()
const router = useRouter();
const USER_API = 'users';

const currentUsername = ref<string>('');
const currentPassword = ref<string>('');
const repeatedPassword = ref<string>('');
const currentIsAdmin = ref<boolean>(false);
const currentUserId = ref<bigint>();

type PasswordVisibility =  'password' | 'text';

const passwordType = ref<PasswordVisibility>('password');

const errors = ref<string[]>([]);
const overlayActive = ref<boolean>(false);
const overlayYesHandler = ref<() => void>(() => {});
const overlayText = ref<string>("")

onMounted(() => {
  loadUsers();
  getCurrentUserId();
});
const users = ref<User[]>([]);
async function loadUsers(): Promise<void> {
  try {
    const response = await api.get(USER_API);
    users.value = response.data;
    console.log(users.value)
  } catch (error) {
    console.log(error);
  }
}
async function getCurrentUserId(): Promise<void> {
  const authresponse = await api.get('/auth', { withCredentials: true });
  currentUserId.value = authresponse.data.user.id;
  console.log(currentUserId.value)
}

async function deleteUser(user: User): Promise<void> {
  try {
    const response = await api.delete(`${USER_API}/${user._id}`);
    await loadUsers();
  } catch (error) {
    console.log(error);
  }
}

async function createUser(): Promise<void> {
  errors.value = getUserErrors();
  if (errors.value.length > 0) return;

  currentPassword.value = currentPassword.value.trim();
  currentUsername.value = currentUsername.value.trim();
  repeatedPassword.value = repeatedPassword.value.trim();

  try {
    const response = await api.get(
      `${USER_API}/by-name/${currentUsername.value}`
    );
    if (response.data.length > 0) {
      errors.value.push('User with this name already exists');
      return;
    }
  } catch (error) {
    errors.value.push('Error validating data - try again later');
    return;
  }

  const passwordHash = await User.hashPassword(currentPassword.value);
  const newUser = new User(
    currentUsername.value,
    passwordHash,
    currentIsAdmin.value
  );

  try {
    const response = await api.post(USER_API, newUser);
    newUser._id = response.data.insertedId;

    await loadUsers();
    currentIsAdmin.value = false;
    currentPassword.value = '';
    currentUsername.value = '';
    repeatedPassword.value = '';
  } catch (error) {
    errors.value.push('Error creating user: ' + error);
  }
}
function getUserErrors(): string[] {
  const e = [];
  if (currentUsername.value.trim().length <= 0)
    e.push('Username cannot be empty');
  if (currentPassword.value.trim().length < 8)
    e.push('Password needs at least 8 characters'); //Someone can go crazy here with requirements lmao
  if (repeatedPassword.value.trim() !== currentPassword.value.trim())
    e.push('Password does not match repeated password');
  return e;
}

function activateOverlay(handler: (user: User) => void, text: string, user: User){
  overlayYesHandler.value = () => handler(user);
  overlayText.value = text
  overlayActive.value = true
  console.log("isActive: " + overlayActive.value)
}

function togglePasswordVisibility(): void {
  passwordType.value = passwordType.value == 'password' ? 'text' : 'password';
}
</script>

<template>
  <mobile-header></mobile-header>
  <h1 class="section-heading">Manage Accounts</h1>
    <ErrorView :errors="errors"></ErrorView>
  <div class="content-container fitScreenHeight">
    <div class="content-block">
      <h2>Registered Users</h2>
      <div class="scrollable-container">
        <div class="list" v-for="user in users">
          <span>{{ user.userName }} <em v-if="user.isAdmin">admin</em></span>
          <button v-if="currentUserId != user._id" @click='activateOverlay(deleteUser, "Are you sure you want to delete this User?", user)' class="btn-caution btn-square">
            X
          </button>
          <button v-else class="btn-disabled btn-square" disabled>
            X
          </button>
        </div>
      </div>

    </div>
    <span v-if="width > 600" class="vertical-divider"></span>
    <div class="content-block">
      <h2>Create user</h2>
      <div class="labeled-input">
        <label for="input-username">Username</label> 
        <input
            type="text"
            name="input-username"
            v-model="currentUsername"
            placeholder="Username"
        />
      </div>
      <div class="labeled-input">
        <label for="input-password">Password</label>
        <input
            name="input-password"
            :type="passwordType"
            v-model="currentPassword"
            placeholder="Password"
        />
      </div>
      <div class="labeled-input">
        <input
            name="input-reenterpassword"
            :type="passwordType"
            v-model="repeatedPassword"
            placeholder="Reenter Password"
        />
      </div>
      <button @click="togglePasswordVisibility">{{ passwordType == 'text' ? '😐' : '😑' }}</button>

      <label class="checkbox-wrapper">
        <input
            name="input-isadmin"
            type="checkbox"
            v-model="currentIsAdmin"
            class="checkbox-input"
        />
        <span class="custom-checkbox"></span>
        Is Admin
      </label>

      <button @click="createUser()" class="btn-primary">Create user</button>
    </div>

  </div>

  <YesNoOverlay v-model="overlayActive" :text="overlayText" @yes="overlayYesHandler"></YesNoOverlay>

  <!-- <NavigationBarBottom></NavigationBarBottom> -->

</template>

<style scoped>
h2{
  font-size: 20px;

}

label {
margin-top: 20px;

}
</style>
