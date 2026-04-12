import { defineStore } from 'pinia';
import { reactive, ref, useTemplateRef, watch } from 'vue';
import type { MvctElement } from '@/interfaces/MvctElement';
import type {
	ActiveElementProperties,
	ActiveElementType,
} from '@/interfaces/ActiveElementProperties';

export const useInspector = defineStore('inspector', () => {
	const activeElement = ref<MvctElement | null>(null);
	const inspectorRef = useTemplateRef<HTMLDivElement>('inspector');
	const activeElementProperties = reactive<ActiveElementProperties>({
		type: 'rect',
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		radius: 0,
		rotation: 0,
	});
	const saveFunction = ref<() => void>(() => {});

	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	function setActiveElement(element: MvctElement) {
		console.log('Setting active element:', element);
		activeElement.value = element;
		updateCurrentProperties();
	}

	function clearActiveElement() {
		activeElement.value = null;
	}

	function updateCurrentProperties() {
		if (!activeElement.value) return;

		activeElementProperties.type = activeElement.value.node.tagName as ActiveElementType;
		activeElementProperties.x = Number(activeElement.value.x());
		activeElementProperties.y = Number(activeElement.value.y());

		if (activeElementProperties.type === 'rect') {
			activeElementProperties.width = Number(activeElement.value.width());
			activeElementProperties.height = Number(activeElement.value.height());
		} else if (activeElementProperties.type === 'circle') {
			activeElementProperties.radius = Number(activeElement.value.attr('r'));
		}

		activeElementProperties.rotation = Number(activeElement.value.transform('rotate'));
	}

	watch(
		activeElementProperties,
		(newProperties) => {
			if (!activeElement.value) return;

			activeElement.value.x(Number(newProperties.x));
			activeElement.value.y(Number(newProperties.y));

			if (newProperties.type === 'rect') {
				activeElement.value.width(Number(newProperties.width));
				activeElement.value.height(Number(newProperties.height));
			} else if (newProperties.type === 'circle') {
				activeElement.value.attr('r', Number(newProperties.radius));
			}

			activeElement.value.transform({ rotate: Number(newProperties.rotation) });

			if (saveTimeout) clearTimeout(saveTimeout);

			saveTimeout = setTimeout(saveFunction.value, 500);
		},
		{ deep: true },
	);

	return {
		activeElement,
		inspectorRef,
		activeElementProperties,
		saveFunction,
		setActiveElement,
		clearActiveElement,
		updateCurrentProperties,
	};
});
