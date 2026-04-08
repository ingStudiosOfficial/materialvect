<script setup lang="ts">
import type { Mvct } from '@/interfaces/Mvct';
import { Element, List, Svg, SVG, type StrokeData } from '@svgdotjs/svg.js';
import { onMounted, reactive, ref, toRaw } from 'vue';

interface ComponentProps {
	vector: Mvct;
}

const props = defineProps<ComponentProps>();
const vector = reactive<Mvct>(window.structuredClone(toRaw(props.vector)));
const svgCanvas = ref<Svg | null>(null);
const draggedElement = ref<Element | null>(null);

let isDragging = false;
let startPoint = { x: 0, y: 0 };
let initialElementPos = { x: 0, y: 0 };

function registerElements(elements: List<Element>) {
	for (const element of elements) {
		const elementId = element.attr('mvect-id');
		const originalStrokeStyles: StrokeData = {
			color: element.attr('stroke'),
			width: element.attr('stroke-width'),
			linecap: element.attr('linecap'),
		};

		if (!elementId) {
			element.attr('mvect-id', window.crypto.randomUUID());
		}

		element.attr({
			cursor: 'pointer',
		});

		element.on('focus', (event) => {
			event.stopPropagation();

			console.log('Element gained focus:', event.target);

			element.stroke({
				color: 'var(--md-sys-color-primary)',
				width: 2,
				linecap: 'round',
			});
		});

		element.on('focusout', (event) => {
			console.log('Element lost focus:', event.target);

			element.stroke(originalStrokeStyles);
		});

		element.on('pointerdown', (event) => {
			if (svgCanvas.value === null) return;

			const mouseEvent = event as MouseEvent;

			draggedElement.value = element;

			console.log('Pointerdown on:', mouseEvent.target);

			mouseEvent.stopPropagation();
			isDragging = true;

			const pt = svgCanvas.value.point(mouseEvent.clientX, mouseEvent.clientY);
			startPoint = { x: pt.x, y: pt.y };

			initialElementPos = {
				x: element.x() as number,
				y: element.y() as number,
			};

			window.addEventListener('pointermove', handleGlobalMove);
			window.addEventListener('pointerup', handleGlobalUp);
		});
	}
}

function handleGlobalMove(event: MouseEvent) {
	if (!isDragging || !svgCanvas.value || !draggedElement.value) return;

	const pt = svgCanvas.value.point(event.clientX, event.clientY);

	const deltaX = pt.x - startPoint.x;
	const deltaY = pt.y - startPoint.y;

	draggedElement.value.move(initialElementPos.x + deltaX, initialElementPos.y + deltaY);
}

function handleGlobalUp() {
	console.log('Handing element up:', draggedElement.value);

	isDragging = false;
	startPoint = { x: 0, y: 0 };
	initialElementPos = { x: 0, y: 0 };
	window.removeEventListener('mousemove', handleGlobalMove);
	window.removeEventListener('mouseup', handleGlobalUp);
}

onMounted(() => {
	const svgVector = SVG().addTo('.svg-wrapper').size('100%', '100%');
	svgVector.viewbox(0, 0, props.vector.metadata.width, props.vector.metadata.height);

	svgCanvas.value = svgVector;

	svgVector.svg(vector.svg);

	const allElements = svgVector.find('*');

	registerElements(allElements);
});
</script>

<template>
	<div class="editor-area">
		<div class="svg-wrapper"></div>
	</div>
</template>

<style scoped>
.editor-area {
	box-sizing: border-box;
	padding: 20px;
	border-radius: 25px 0 0 25px;
	background-color: var(--md-sys-color-primary-container);
	color: var(--md-sys-color-on-primary-container);
	display: flex;
	align-items: center;
	justify-content: center;
}

.svg-wrapper {
	aspect-ratio: v-bind('props.vector.metadata.width') / v-bind('props.vector.metadata.height');
	height: 100%;
	background-color: #ffffff;
	box-sizing: border-box;
	box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.1);
}

.svg-wrapper :deep(*) {
	outline: none;
}
</style>
