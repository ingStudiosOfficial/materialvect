<script setup lang="ts">
import type { Mvct } from '@/interfaces/Mvct';
import { onMounted, toRaw, useTemplateRef } from 'vue';
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

const hiddenInputArea = useTemplateRef<HTMLInputElement>('hiddenInputArea');

function emitVectorData() {
	if (!inspectorStore.svgCanvas || inspectorStore.isDragging) return;

	const svgCanvasToSave = (inspectorStore.svgCanvas as Svg).clone(true);

	svgCanvasToSave.find('.mvct-focus').forEach((el) => {
		el.removeClass('mvct-focus');
	});

	const newMvct = window.structuredClone(toRaw(inspectorStore.vector));
	if (!newMvct) return;
	newMvct.svg = svgCanvasToSave.node.innerHTML;

	emit('change', newMvct);
}

function onInputFocus() {
	hiddenInputArea.value?.focus();
}

function setTextValue() {
	if (!hiddenInputArea.value) return;

	console.log('Setting text:', hiddenInputArea.value.value);

	inspectorStore.textInputString = hiddenInputArea.value.value;
}

onMounted(() => {
	inspectorStore.initialize(props.vector, emitVectorData, onInputFocus);
});
</script>

<template>
	<div class="editor-area">
		<div class="svg-wrapper" tabindex="0"></div>
		<input class="hidden-input-area" ref="hiddenInputArea" @input="setTextValue()" />
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

.hidden-input-area {
	display: none;
}
</style>
