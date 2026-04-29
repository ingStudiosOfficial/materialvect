import { ref } from 'vue';

const openWelcomeFunction = ref<(() => void) | null>(null);

export function useWelcome() {
	return {
		openWelcomeFunction,
	};
}
