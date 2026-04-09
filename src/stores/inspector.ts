import { defineStore } from 'pinia';
import { ref, useTemplateRef } from 'vue';
import type { MvctElement } from '@/interfaces/MvctElement';

export const useInspector = defineStore('inspector', () => {
	const activeElement = ref<MvctElement | null>(null);
	const inspectorRef = useTemplateRef<HTMLDivElement>('inspector');

	function setActiveElement(element: MvctElement) {
		console.log('Setting active element:', element);
		activeElement.value = element;
	}

	function removeActiveElement(element: MvctElement) {
		if (element.attr('mvct-id') !== activeElement.value?.attr('mvct-id')) {
			console.error('Remove active element ID does not match.');
			return;
		}

		activeElement.value = null;
	}

	function setElementX(event: InputEvent) {
		const x = (event.target as HTMLInputElement).value;

		if (x === activeElement.value?.x()) return;

		activeElement.value?.x(x);
	}

	function setElementY(event: InputEvent) {
		const y = (event.target as HTMLInputElement).value;

		if (y === activeElement.value?.y()) return;

		activeElement.value?.y(y);
	}

	return {
		activeElement,
		inspectorRef,
		setElementX,
		setElementY,
		setActiveElement,
		removeActiveElement,
	};
});
