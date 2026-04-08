<script setup lang="ts">
import type { Mvct } from '@/interfaces/Mvct';
import { Element, List, SVG } from '@svgdotjs/svg.js';
import { onMounted, reactive, toRaw } from 'vue';

interface ComponentProps {
	vector: Mvct;
}

const props = defineProps<ComponentProps>();
const vector = reactive<Mvct>(window.structuredClone(toRaw(props.vector)));

function registerElements(elements: List<Element>) {
	for (const element of elements) {
		const elementId = element.attr('mvect-id');

		if (!elementId) {
			element.attr('mvect-id', window.crypto.randomUUID());
		}

		element.attr({
			cursor: 'pointer',
		});

		element.on('focus', (event) => {
			event.stopPropagation();

			console.log('Element gained focus:', event.target);

			element.attr({ 'mvect-select-stroke': true });

			element.stroke({
				color: 'var(--md-sys-color-primary)',
				width: 2,
				linecap: 'round',
			});
		});

		element.on('focusout', (event) => {
			console.log('Element lost focus:', event.target);

			element.attr('mvect-select-stroke', null);

			element.stroke();
		});
	}
}

onMounted(() => {
	const svgVector = SVG().addTo('.svg-wrapper').size('100%', '100%');
	svgVector.viewbox(0, 0, props.vector.metadata.width, props.vector.metadata.height);

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
</style>
