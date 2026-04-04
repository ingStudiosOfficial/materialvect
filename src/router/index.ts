import HomeView from '@/views/HomeView.vue';
import NewView from '@/views/NewView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{ path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
		{ path: '/new', name: 'new', component: NewView, meta: { title: 'New Vector' } },
	],
});

router.beforeEach((to) => {
	document.title = `${to.meta.title} | Materialvect`;
});

export default router;
