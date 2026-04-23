<script setup lang="ts">
import { useEditor } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import '@m3e/web/button';
import '@m3e/web/button-group';
import { onMounted } from 'vue';

const editorStore = useEditor();

const { activeElement, activeElementProperties, vector } = storeToRefs(editorStore);

function openColorPicker() {
	if (!editorStore.openColorPickerFunction) return;

	editorStore.openColorPickerFunction();
}

function openFontPicker() {
	if (!editorStore.openFontFunction) return;

	editorStore.openFontFunction();
}

function setVectorDimensions() {
	if (!vector.value) return;

	const width = activeElementProperties.value.width;
	const height = activeElementProperties.value.height;

	vector.value.metadata.width = width;
	vector.value.metadata.height = height;

	editorStore.saveFunction();
}

onMounted(async () => {
	/*
	try {
		systemFonts.value = await getAllLocalFonts();
	} catch (error) {
		console.error('Error while fetching local fonts:', error);
		M3eSnackbar.open((error as Error).message, {
			duration: 4000,
		});
	}
        */
});
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
					activeElementProperties.type === 'ellipse' ||
					activeElementProperties.type === 'image'
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
			<button
				class="color-picker-btn"
				:style="{
					backgroundColor: editorStore.inspectorLastSelectedColor,
				}"
				@click="openColorPicker()"
			>
				Choose color
			</button>

			<div v-if="activeElementProperties.type === 'text'" class="conditional-container">
				<p>Font</p>
				<m3e-button variant="outlined" @click="openFontPicker()">Select font</m3e-button>
			</div>
			<div v-if="activeElementProperties.type === 'text'" class="conditional-container">
				<p>Font size</p>
				<input class="inspector-input" v-model.number="activeElementProperties.fontSize" />
			</div>
		</div>
		<div v-else class="inspector-wrapper">
			<h4>Canvas Inspector</h4>
			<p>Width</p>
			<input
				class="inspector-input"
				v-model.number="activeElementProperties.width"
				@input="setVectorDimensions()"
			/>
			<p>Height</p>
			<input
				class="inspector-input"
				v-model.number="activeElementProperties.height"
				@input="setVectorDimensions"
			/>
			<p>Color</p>
			<button
				class="color-picker-btn"
				:style="{
					backgroundColor: editorStore.inspectorLastSelectedColor,
				}"
				@click="openColorPicker()"
			>
				Choose color
			</button>
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
