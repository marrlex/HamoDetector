import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Harmony from '@/views/Harmony.vue'
import Learning from '@/views/Learning.vue'
import Level31 from '@/views/learning/level3/1.vue'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Harmony',
    component: Harmony
  },
  {
    path: '/learning',
    component: Learning,
    children: [
      {
        path: '',
        component: () => import('@/views/learning/top.vue')
      },
      {
        path: 'level1/1',
        component: () => import('@/views/learning/level1/1.vue')
      },
      {
        path: 'level1/2',
        component: () => import('@/views/learning/level1/2.vue')
      },
      {
        path: 'level2/1',
        component: () => import('@/views/learning/level2/1.vue')
      },
      {
        path: 'level2/2',
        component: () => import('@/views/learning/level2/2.vue')
      },
      {
        path: 'level2/3',
        component: () => import('@/views/learning/level2/3.vue')
      },
      {
        path: 'level3/1',
        component: Level31
      },
      {
        path: 'level3/2',
        component: () => import('@/views/learning/level3/2.vue')
      },
      {
        path: 'level3/3',
        component: () => import('@/views/learning/level3/3.vue')
      },
      {
        path: 'level3/4',
        component: () => import('@/views/learning/level3/4.vue')
      },
      {
        path: 'level4/1',
        component: () => import('@/views/learning/level4/1.vue')
      },
      {
        path: 'level4/2',
        component: () => import('@/views/learning/level4/2.vue')
      },
    ]
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

export default router
