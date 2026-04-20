<script setup lang="ts">
import type { Mvct } from '@/interfaces/Mvct';
import { onMounted, toRaw } from 'vue';
import { useEditor } from '@/stores/editor';
import type { Svg } from '@svgdotjs/svg.js';

interface ComponentProps {
	vector: Mvct;
}

interface ComponentEmits {
	(e: 'change', vector: Mvct): void;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits<ComponentEmits>();

const inspectorStore = useEditor();

function emitVectorData() {
	if (!inspectorStore.svgCanvas || inspectorStore.isDragging) return;

	const svgCanvasToSave = (inspectorStore.svgCanvas as Svg).clone(true);

	svgCanvasToSave.find('.mvct-focus').forEach((el) => {
		el.removeClass('mvct-focus');
	});

	for (const el of inspectorStore.allElements) {
		const elementInCanvas = svgCanvasToSave.findOne(`[mvct-id="${el.attr('mvct-id')}"]`);

		if (el.isTextHidden) {
			elementInCanvas?.show();
		}

		if (elementInCanvas?.attr('mvct-image')) {
			console.log('Mvct image file found:', elementInCanvas.attr('mvct-image'));
			elementInCanvas.attr('href', elementInCanvas.attr('mvct-image'));
		}
	}

	svgCanvasToSave.findOne('[mvct-style="true"]')?.remove();

	const newMvct = window.structuredClone(toRaw(inspectorStore.vector));
	if (!newMvct) return;
	newMvct.svg = svgCanvasToSave.node.innerHTML;

	emit('change', newMvct);
}

onMounted(() => {
	inspectorStore.initialize(props.vector, emitVectorData);
});
</script>

<template>
	<div class="editor-area">
		<div class="svg-wrapper" tabindex="0"></div>
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
	container-type: size;
}

.svg-wrapper {
	aspect-ratio: v-bind('props.vector.metadata.width') / v-bind('props.vector.metadata.height');
	width: min(
		100cqw,
		calc(
			100cqh *
				(v-bind('props.vector.metadata.width') / v-bind('props.vector.metadata.height'))
		)
	);
	height: auto;
	max-width: 100%;
	max-height: 100%;
	background-color: #ffffff;
	min-width: 0;
	min-height: 0;
	flex-shrink: 1;
	object-fit: contain;
	box-sizing: border-box;
	box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.1);
	touch-action: none;
	user-select: none;
	-webkit-user-select: none;
	-webkit-touch-callout: none;
	-webkit-tap-highlight-color: transparent;
}

.svg-wrapper :deep(*) {
	outline: none;
}

.svg-wrapper:deep(.mvct-focus) {
	stroke: var(--md-sys-color-primary) !important;
	stroke-width: 2px !important;
	vector-effect: non-scaling-stroke;
}

@media (max-width: 768px) {
	.editor-area {
		border-radius: 0 0 25px 25px;
	}
}
</style>
