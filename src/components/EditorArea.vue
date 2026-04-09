<script setup lang="ts">
import type { Mvct } from '@/interfaces/Mvct';
import { Element as SvgElement, List, Svg, SVG } from '@svgdotjs/svg.js';
import { onMounted, reactive, ref, toRaw } from 'vue';

interface ComponentProps {
	vector: Mvct;
}

interface ComponentEmits {
	(e: 'change', vector: Mvct): void;
}

interface MvctElement extends SvgElement {
	originalCursorState: string;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits<ComponentEmits>();

const vector = reactive<Mvct>(window.structuredClone(toRaw(props.vector)));
const svgCanvas = ref<Svg | null>(null);
const draggedElement = ref<SvgElement | null>(null);
const allElements = reactive<MvctElement[]>([]);

let isDragging = false;
let startPoint = { x: 0, y: 0 };
let initialElementPos = { x: 0, y: 0 };

function registerElements(elements: List<SvgElement>) {
	for (const element of elements) {
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

		mvctElement.on('focus', (event) => {
			event.stopPropagation();

			console.log('Element gained focus:', event.target);

			mvctElement.addClass('mvct-focus');
		});

		mvctElement.on('focusout', (event) => {
			console.log('Element lost focus:', event.target);

			mvctElement.removeClass('mvct-focus');
		});

		mvctElement.on('pointerdown', (event) => {
			if (svgCanvas.value === null) return;

			const mouseEvent = event as MouseEvent;

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

	emitVectorData();

	window.removeEventListener('pointermove', handleGlobalMove);
	window.removeEventListener('pointerup', handleGlobalUp);
}

function emitVectorData() {
	if (!svgCanvas.value) return;

	const svgCanvasToSave = svgCanvas.value.clone(true);

	svgCanvasToSave.find('.mvct-focus').forEach((el) => {
		el.removeClass('mvct-focus');
	});

	const newMvct = window.structuredClone(toRaw(vector));
	newMvct.svg = svgCanvasToSave.svg();

	emit('change', newMvct);
}

onMounted(() => {
	const svgVector = SVG().addTo('.svg-wrapper').size('100%', '100%');
	svgVector.viewbox(0, 0, props.vector.metadata.width, props.vector.metadata.height);

	svgCanvas.value = svgVector;

	svgVector.svg(vector.svg);

	const foundElements = svgVector.find('*');

	registerElements(foundElements);
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

.svg-wrapper:deep(.mvct-focus) {
	stroke: var(--md-sys-color-primary) !important;
	stroke-width: 2px !important;
	vector-effect: non-scaling-stroke;
}
</style>
