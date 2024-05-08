// Запросы к серверу
import axios from "axios";
axios.defaults.baseURL = 'https://litclub-5pbp.onrender.com/';

// Работа с датой
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.locale('ru');
dayjs.extend(relativeTime)

// Всё для vue
import { createApp } from 'vue'
import App from './App.vue'
import router from '../router.js';


import VueCookies from 'vue-cookies';
import store from '../store.js';
createApp(App).config.productionTip = false;

// Рендер в HTML
createApp(App).use(router).use(VueCookies).use(store).mount('#app');
