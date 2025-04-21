import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import songsOverview from './components/songsOverview.vue'
import setListOverview from './components/setListOverview.vue'
import eventOverview from './components/eventOverview.vue'
import createSong from './components/createSong.vue'
import createSetlist from './components/createSetlist.vue'
import songView from './components/songView.vue'
import setlistView from './components/setlistView.vue'
import createEvent from './components/createEvent.vue'
import adminPage from './components/adminPage.vue'
import editSong from './components/editSong.vue'
import landingPage from './components/landingPage.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'landing-page', component: landingPage },
        { path: '/home', name: 'events', component: eventOverview },
        { path: '/songs', name: 'songs', component: songsOverview },
        { path: '/setlists', name: 'setlists', component: setListOverview },
        { path: '/create-song', name: 'createsong', component: createSong },
        { path: '/create-setlist', name: 'createsetlist', component: createSetlist },
        { path: '/songs/:id', name: 'viewsong', component: songView },
        { path: '/setlists/:id', name: 'viewsetlist', component: setlistView },
        { path: '/create-event', name: 'create-event', component: createEvent},
        { path: '/manage-users', name: 'admin-page', component: adminPage},
        { path: '/edit-event/:id', name: 'edit-event', component: createEvent },
        { path: '/songs/edit-song/:id', name: 'edit-song', component: editSong },
        { path: '/edit-setlist/:id', name: 'edit-setlist', component: createSetlist }
    ]
});

const app = createApp(App)

app.use(router);
app.mount('#app')
//createApp(App).mount('#app')
