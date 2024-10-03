// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import { videoRouter } from './videoRouter';
import { userRouter } from './userRouter';
import { documentRouter } from './documentRouter';
import { mypageRouter } from './mypageRouter';
import { reservationRouter } from './reservationRouter';
import { boardRouter } from './boardRouter';



const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  ...userRouter,
  ...videoRouter,
  ...documentRouter,
  ...mypageRouter,
  ...reservationRouter,
  ...boardRouter
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
