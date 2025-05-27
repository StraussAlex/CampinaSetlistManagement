<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';
import User from '../models/User';
import NavigationBarBottom from './elements/Navigation-Bar-Bottom.vue';
import MobileNavBar from './elements/Mobile-Navigation-Bar.vue';
import MobileHeader from "./elements/Mobile-Header.vue";
import ErrorView from './elements/Error-View.vue';
import YesNoOverlay from "./elements/YesNo-Overlay.vue";

const router = useRouter();
const USER_API = 'users';

const currentUsername = ref<string>('');
const currentPassword = ref<string>('');
const repeatedPassword = ref<string>('');
const currentIsAdmin = ref<boolean>(false);

type PasswordVisibility =  'password' | 'text';

const passwordType = ref<PasswordVisibility>('password');

const errors = ref<string[]>([]);
const overlayActive = ref<boolean>(false);
const overlayYesHandler = ref<() => void>(() => {});
const overlayText = ref<string>("")

onMounted(() => {
  loadUsers();
});
const users = ref<User[]>([]);
async function loadUsers(): Promise<void> {
  try {
    const response = await api.get(USER_API);
    users.value = response.data;
  } catch (error) {
    console.log(error);
  }
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
  <div class="content-container">
    <h2>Registered Users</h2>
      <div class="list" v-for="user in users">
        <span>{{ user.userName }} Admin: {{ user.isAdmin }}</span>
        <button @click='activateOverlay(deleteUser, "Are you sure you want to delete this User?", user)' class="btn-caution btn-square">
          X
        </button>
      </div>
    <h2>Create user</h2>
  <div class="labeled-input">
    <label for="input-username">Username</label> <br />
    <input
      type="text"
      name="input-username"
      v-model="currentUsername"
      placeholder="Username"
    />
  </div>
  <div class="labeled-input">
    <label for="input-password">Password</label> <br />
    <input
      name="input-password"
      :type="passwordType"
      v-model="currentPassword"
      placeholder="Password"
    />
  </div>
  <div class="labeled-input">
    <label for="input-reenterpassword">Reenter Password</label> <br />
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

  <ErrorView :errors="errors"></ErrorView>
  </div>

  <YesNoOverlay v-model="overlayActive" :text="overlayText" @yes="overlayYesHandler"></YesNoOverlay>

  <!-- <NavigationBarBottom></NavigationBarBottom> -->

</template>

<style scoped></style>
