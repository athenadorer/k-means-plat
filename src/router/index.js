import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    redirect: '/index',
  },
  {
    path: '/index',
    name: 'home',
    component: Home,
  },
  {
    path: '/input',
    name: 'input',
    component: () =>
      import(/* webpackChunkName: "input" */ '../views/Input.vue'),
  },
  {
    path: '/cluster',
    name: 'cluster',
    component: () =>
      import(/* webpackChunkName: "cluster" */ '../views/About.vue'),
  },
  {
    path: '/history',
    name: 'history',
    component: () =>
      import(/* webpackChunkName: "history" */ '../views/About.vue'),
  },
  {
    path: '/about',
    name: 'about',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
