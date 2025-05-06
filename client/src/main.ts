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
import eventView from './components/eventView.vue'
import adminPage from './components/adminPage.vue'
import editSong from './components/editSong.vue'
import landingPage from './components/landingPage.vue'
import login from './components/login.vue'
import api from './services/api'

const router = createRouter({
    history: createWebHistory(),
    routes: [
      { 
        path: '/', 
        name: 'landing-page', 
        component: landingPage 
      },
      { 
        path: '/login', 
        name: 'login', 
        component: login 
      },
      { 
        path: '/events', 
        name: 'events', 
        component: eventOverview, 
        meta: { requiresAuth: true } 
      },
      { 
        path: '/create-event', 
        name: 'create-event', 
        component: createEvent,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/events/:id', 
        name: 'viewevent', 
        component: eventView,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/edit-event/:id', 
        name: 'edit-event', 
        component: createEvent,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/songs', 
        name: 'songs', 
        component: songsOverview,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/create-song', 
        name: 'create-song', 
        component: createSong,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/songs/:id', 
        name: 'viewsong', 
        component: songView,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/songs/edit-song/:id',
        name: 'createsong',
        component: editSong,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/setlists', 
        name: 'setlists', 
        component: setListOverview,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/create-setlist', 
        name: 'createsetlist', 
        component: createSetlist,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/setlists/:id', 
        name: 'viewsetlist', 
        component: setlistView,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/edit-setlist/:id', 
        name: 'edit-setlist', 
        component: createSetlist,
        meta: { requiresAuth: true } 
      },
      { 
        path: '/manage-users', 
        name: 'admin-page', 
        component: adminPage,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
    ]
  });
  
  // checks if authenticated when needed, otherwise reroutes to /login
  router.beforeEach(async (to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
      try {
        const response = await api.get('/auth', { withCredentials: true });
        const user = response.data.user;
  
        if (!response.data.authenticated) {
          return next('/login');
        }
  
        if (to.meta.requiresAdmin && !user.isAdmin) {
          return next('/'); 
        }
  
        next();
      } catch (error) {
        console.error('Authentication check failed:', error);
        next('/login');
      }
    } else {
      next();
    }
  });
  

const app = createApp(App)

app.use(router);
app.mount('#app')
//createApp(App).mount('#app')
