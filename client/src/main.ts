import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import songsOverview from './components/songsOverview.vue'
import setListOverview from './components/setListOverview.vue'
import eventOverview from './components/eventOverview.vue'
import createSong from './components/createSong.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'events', component: eventOverview },
        { path: '/songs', name: 'songs', component: songsOverview },
        { path: '/setlists', name: 'setlists', component: setListOverview },
        { path: '/create-song', name: 'create-song', component: createSong },
        
    ]
});

const app = createApp(App)

app.use(router);
app.mount('#app')
//createApp(App).mount('#app')
