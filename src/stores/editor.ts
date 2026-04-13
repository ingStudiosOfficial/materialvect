import { defineStore } from 'pinia';
import { reactive, ref, watch } from 'vue';
import type { MvctElement } from '@/interfaces/MvctElement';
import type { ActiveElementProperties } from '@/interfaces/ActiveElementProperties';
import { List, SVG, type Svg, type Element as SvgElement } from '@svgdotjs/svg.js';
import type { Mvct } from '@/interfaces/Mvct';
import type { MvctShape } from '@/interfaces/Shape';

export const useEditor = defineStore('editor', () => {
	const activeElement = ref<MvctElement | null>(null);
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
	const vector = ref<Mvct | null>(null);
	const svgCanvas = ref<Svg | null>(null);
	const draggedElement = ref<SvgElement | null>(null);
	const allElements = reactive<MvctElement[]>([]);

	let isDragging = false;
	let startPoint = { x: 0, y: 0 };
	let initialElementPos = { x: 0, y: 0 };

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

		activeElementProperties.type = activeElement.value.node.tagName as MvctShape;
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

	function initialize(loadedVector: Mvct, save: () => void) {
		vector.value = loadedVector;

		const svgVector = SVG().addTo('.svg-wrapper').size('100%', '100%');
		svgVector.viewbox(0, 0, vector.value.metadata.width, vector.value.metadata.height);

		svgVector.on('pointerdown', (event) => {
			if (event.target === svgVector.node) {
				allElements.forEach((element) => {
					element.removeClass('mvct-focus');
				});
				clearActiveElement();
			}
		});

		svgCanvas.value = svgVector;

		svgVector.svg(vector.value.svg);

		const foundElements = svgVector.find('*');

		registerElements(foundElements);

		saveFunction.value = save;
	}

	function registerElement(element: SvgElement) {
		const elementId = element.attr('mvect-id');
		if (!elementId) {
			element.attr('mvect-id', window.crypto.randomUUID());
		}

		const mvctElement = element as MvctElement;
		mvctElement.originalCursorState = element.attr('cursor');

		allElements.push(mvctElement);

		mvctElement.attr({
			cursor: 'pointer',
			tabindex: 0,
		});

		mvctElement.on('pointerdown', (event) => {
			if (svgCanvas.value === null) return;

			const mouseEvent = event as MouseEvent;
			mouseEvent.stopPropagation();

			setActiveElement(mvctElement);

			allElements.forEach((element) => {
				element.removeClass('mvct-focus');
			});
			mvctElement.addClass('mvct-focus');

			draggedElement.value = mvctElement;

			console.log('Pointerdown on:', mouseEvent.target);

			mouseEvent.stopPropagation();
			isDragging = true;

			const pt = svgCanvas.value.point(mouseEvent.clientX, mouseEvent.clientY);
			startPoint = { x: pt.x, y: pt.y };

			initialElementPos = {
				x: mvctElement.x() as number,
				y: mvctElement.y() as number,
			};

			window.addEventListener('pointermove', handleGlobalMove);
			window.addEventListener('pointerup', handleGlobalUp);
		});
	}

	function registerElements(elements: List<SvgElement>) {
		for (const element of elements) {
			registerElement(element);
		}
	}

	function handleGlobalMove(event: MouseEvent) {
		if (!isDragging || !svgCanvas.value || !draggedElement.value) return;

		const pt = svgCanvas.value.point(event.clientX, event.clientY);

		const deltaX = pt.x - startPoint.x;
		const deltaY = pt.y - startPoint.y;

		draggedElement.value.move(initialElementPos.x + deltaX, initialElementPos.y + deltaY);

		updateCurrentProperties();
	}

	function handleGlobalUp() {
		console.log('Handing element up:', draggedElement.value);

		isDragging = false;
		startPoint = { x: 0, y: 0 };
		initialElementPos = { x: 0, y: 0 };

		window.removeEventListener('pointermove', handleGlobalMove);
		window.removeEventListener('pointerup', handleGlobalUp);
	}

	function createShape(shape: MvctShape) {
		if (!svgCanvas.value) return;

		if (shape === 'rect') {
			const rect = svgCanvas.value.rect(100, 100).attr({
				fill: 'var(--md-sys-color-primary-container)',
				x: svgCanvas.value.bbox().width / 2,
				y: svgCanvas.value.bbox().height / 2,
			});

			registerElement(rect);
		}
	}

	return {
		svgCanvas,
		isDragging,
		vector,
		activeElement,
		activeElementProperties,
		initialize,
		createShape,
	};
});
