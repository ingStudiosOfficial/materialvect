<script setup lang="ts">
import { useEditor } from '@/stores/editor';
import { storeToRefs } from 'pinia';

const inspectorStore = useEditor();
const { activeElement, activeElementProperties } = storeToRefs(inspectorStore);
</script>

<template>
	<div v-if="activeElement" class="inspector-wrapper" tabindex="0">
		<h4>Element Inspector</h4>
		<p>X</p>
		<input class="inspector-input" v-model.number="activeElementProperties.x" />
		<p>Y</p>
		<input class="inspector-input" v-model.number="activeElementProperties.y" />

		<div v-if="activeElementProperties.type === 'rect'">
			<p>Width</p>
			<input class="inspector-input" v-model.number="activeElementProperties.width" />
			<p>Height</p>
			<input class="inspector-input" v-model.number="activeElementProperties.height" />
		</div>
		<div v-else-if="activeElementProperties.type === 'circle'">
			<p>Radius</p>
			<input class="inspector-input" v-model.number="activeElementProperties.radius" />
		</div>

		<p>Rotation</p>
		<input class="inspector-input" v-model.number="activeElementProperties.rotation" />
	</div>
	<div v-else class="inspector-wrapper">
		<p>No element selected.</p>
	</div>
</template>

<style scoped>
.inspector-wrapper {
	background-color: var(--md-sys-color-surface-container);
	color: var(--md-sys-color-on-surface);
	border-radius: 0 25px 25px 0;
	box-sizing: border-box;
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;
}

.inspector-input {
	width: 100%;
	border: none;
	outline: none;
	background-color: var(--md-sys-color-surface-container-high);
	color: var(--md-sys-color-on-surface);
	box-sizing: border-box;
	padding: 10px;
	border-radius: 10px;
}
</style>
