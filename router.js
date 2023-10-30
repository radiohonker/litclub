
import { createRouter, createWebHistory } from 'vue-router';

import AmongUs from './src/components/among-us.vue';
import Profile from './src/components/profile.vue';
import Book from './src/components/book.vue';
import Filter from './src/components/filter.vue'
import Read from './src/components/read.vue'
export default createRouter({
    base: '/profile',
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'main',
            component: AmongUs,
        },
        {
            path: '/profile',
            name: 'profile',
            component: Profile,
        },
        {
            path: '/book/:id',
            name: 'book',
            component: Book,
        },
        {
            path: '/filter/:array',
            name: 'filter',
            component: Filter,
        },
        {
            path: '/read/:id',
            name: 'read',
            component: Read,
        },
    ],
});
