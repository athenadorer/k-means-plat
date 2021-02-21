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
    path: '/table',
    name: 'tables',
    component: () =>
      import(/* webpackChunkName: "tables" */ '../views/Tables.vue'),
  },
  {
    path: '/table/:key',
    name: 'table',
    component: () =>
      import(/* webpackChunkName: "table" */ '../views/Table.vue'),
  },
  {
    path: '/cluster',
    name: 'clusters',
    component: () =>
      import(/* webpackChunkName: "clusters" */ '../views/Clusters.vue'),
  },
  {
    path: '/cluster/:key',
    name: 'cluster',
    component: () =>
      import(/* webpackChunkName: "cluster" */ '../views/Cluster.vue'),
  },
  {
    path: '/history',
    name: 'history',
    component: () =>
      import(/* webpackChunkName: "history" */ '../views/History.vue'),
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
