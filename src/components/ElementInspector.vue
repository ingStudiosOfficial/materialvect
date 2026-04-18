<script setup lang="ts">
import { useEditor } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import '@m3e/web/button';
import '@m3e/web/button-group';

const editorStore = useEditor();
const { activeElement, activeElementProperties } = storeToRefs(editorStore);

function openColorPicker() {
	if (!editorStore.openColorPickerFunction) return;

	editorStore.openColorPickerFunction();
}
</script>

<template>
	<div class="outer-inspector-wrapper">
		<div v-if="activeElement" class="inspector-wrapper" tabindex="0">
			<h4>Element Inspector</h4>
			<m3e-button-group variant="connected">
				<m3e-button
					variant="outlined"
					@click="editorStore.duplicateElement(editorStore.activeElement)"
					>Duplicate</m3e-button
				>
				<m3e-button
					variant="outlined"
					@click="editorStore.deleteElement(editorStore.activeElement)"
					>Delete</m3e-button
				>
			</m3e-button-group>
			<p>X</p>
			<input class="inspector-input" v-model.number="activeElementProperties.x" />
			<p>Y</p>
			<input class="inspector-input" v-model.number="activeElementProperties.y" />

			<div
				v-if="
					activeElementProperties.type === 'rect' ||
					activeElementProperties.type === 'ellipse'
				"
				class="conditional-container"
			>
				<p>Width</p>
				<input class="inspector-input" v-model.number="activeElementProperties.width" />
				<p>Height</p>
				<input class="inspector-input" v-model.number="activeElementProperties.height" />
			</div>
			<div
				v-else-if="activeElementProperties.type === 'circle'"
				class="conditional-container"
			>
				<p>Radius</p>
				<input class="inspector-input" v-model.number="activeElementProperties.radius" />
			</div>

			<p>Rotation</p>
			<input class="inspector-input" v-model.number="activeElementProperties.rotation" />

			<p>Color</p>
			<!--<input type="color" @input="editorStore.changeColor" />-->
			<button class="color-picker-btn" @click="openColorPicker()">Choose color</button>
		</div>
		<div v-else class="inspector-wrapper">
			<p>No element selected.</p>
		</div>
	</div>
</template>

<style scoped>
.outer-inspector-wrapper {
	height: 100%;
	max-height: 100%;
	overflow-y: scroll;
	position: relative;
}

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
	width: 100%;
	position: absolute;
	min-height: 100%;
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

.color-picker-btn {
	width: 100%;
	padding: 10px;
	border-radius: 10px;
	box-sizing: border-box;
	background-color: var(--md-sys-color-surface-container-high);
	color: transparent;
	cursor: pointer;
}

.color-picker-btn:hover {
	background-image: linear-gradient(rgba(0, 0, 0, 0.1) 0 0);
}

.conditional-container {
	width: 100%;
}

@media (max-width: 768px) {
	.inspector-wrapper {
		border-radius: 25px 25px 0 0;
	}
}
</style>
