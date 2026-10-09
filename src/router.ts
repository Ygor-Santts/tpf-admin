import { createRouter, createWebHistory } from 'vue-router'
import { session } from './session'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/entrar', component: () => import('./views/SignIn.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('./components/AdminLayout.vue'),
      children: [
        { path: '', redirect: '/categorias' },
        { path: 'categorias', component: () => import('./views/Categories.vue') },
        { path: 'usuarios', component: () => import('./views/Users.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Every screen but the sign-in needs an admin session. The API checks the
// admin flag on every call too.
router.beforeEach((to) => {
  if (!to.meta.public && !session.token) return '/entrar'
  if (to.meta.public && session.token) return '/'
})
