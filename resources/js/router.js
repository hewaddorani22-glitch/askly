import { createRouter, createWebHistory } from 'vue-router';
import Landing from './views/Landing.vue';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';
import SessionHost from './views/SessionHost.vue';
import SessionStudent from './views/SessionStudent.vue';

const routes = [
    { path: '/', component: Landing, name: 'Landing' },
    { path: '/login', component: Login, name: 'Login' },
    { path: '/dashboard', component: Dashboard, name: 'Dashboard', meta: { requiresAuth: true } },
    { path: '/dashboard/session/:id', component: SessionHost, name: 'SessionHost', meta: { requiresAuth: true } },
    { path: '/session/:id', component: SessionStudent, name: 'SessionStudent' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('auth_token');
    if (to.meta.requiresAuth && !token) {
        next('/login');
    } else {
        next();
    }
});

export default router;
