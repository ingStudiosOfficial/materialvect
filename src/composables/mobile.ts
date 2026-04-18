import { onMounted, onUnmounted, ref } from 'vue';

export function useMobile() {
	const isMobile = ref<boolean>(window.innerWidth <= 768);

	function update() {
		isMobile.value = window.innerWidth < 768;
	}

	onMounted(() => window.addEventListener('resize', update));
	onUnmounted(() => window.removeEventListener('resize', update));

	return {
		isMobile,
	};
}
