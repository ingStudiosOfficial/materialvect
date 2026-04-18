import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFileSystem = defineStore('filesys', () => {
	const openFileDialogFunction = ref<(() => void) | null>(null);
	const onAllowFunction = ref<(() => unknown) | null>(null);
	const allowMessage = ref<string | null>(null);

	return {
		openFileDialogFunction,
		onAllowFunction,
		allowMessage,
	};
});
