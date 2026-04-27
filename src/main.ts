import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import '@/assets/main.css';
import { mvctToObject } from './utils/mvct';
import { useExternal } from './stores/external';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');

const externalStore = useExternal();

if ('launchQueue' in window) {
	window.launchQueue?.setConsumer(async (launchParams) => {
		if (launchParams.files.length === 0 || !launchParams.files[0]) return;

		const handle = launchParams.files[0];
		if (handle.kind !== 'file') return;

		const file = await (handle as FileSystemFileHandle).getFile();
		const vector = await mvctToObject(file);
		await externalStore.initialize(vector, handle as FileSystemFileHandle);

		router.push({
			name: 'editor',
			query: { local: 'true' },
			params: { id: vector.metadata.id },
		});
	});
}
