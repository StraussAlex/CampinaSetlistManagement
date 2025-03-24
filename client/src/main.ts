import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import songsOverview from './components/songsOverview.vue'
import eventOverview from './components/eventOverview.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'events', component: eventOverview },
        { path: '/songs', name: 'events', component: songsOverview },
    ]
});

const app = createApp(App)

app.use(router);
app.mount('#app')
//createApp(App).mount('#app')
