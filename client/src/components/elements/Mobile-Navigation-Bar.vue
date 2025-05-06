<script setup lang="ts">
import { useRouter } from 'vue-router';

import '/src/stylesheets/nav.css';

const router = useRouter();
function navigateTo(path: string): void {
    router.push(path);
}
</script>

<template>
    <div class="nav-limiter"></div>
    <div class="mobile-navigation-bar">
        <div class = "icon-container">
            <img class = "home" src="../temporary-images/home.png" @click="navigateTo('/events')"></img>
            <div class = "ani_square"></div>
        </div>
        <div class = "icon-container">
            <img class = "setlists" src="../temporary-images/list.png" @click="navigateTo('/setlists')"></img>
            <div class = "ani_square"></div>
        </div>
        <div class = "icon-container">
        <img class = "tracks" src="../temporary-images/music.png" @click="navigateTo('/songs')"></img>
        <div class = "ani_square"></div>
        </div>
    </div>
</template>
