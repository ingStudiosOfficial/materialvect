<script setup lang="ts">
import { getVector, upsertVector } from '@/db';
import type { VectorFile } from '@/interfaces/VectorFile';
import '@m3e/web/app-bar';
import '@m3e/web/form-field';
import '@m3e/web/loading-indicator';
import { nextTick, onMounted, ref, toRaw, useTemplateRef } from 'vue';

const vectorFile = ref<VectorFile | null>(null);
const vectorNameInput = useTemplateRef<HTMLInputElement>('vectorNameInput');

async function updateName() {
	await updateVector();
	await nextTick();
	vectorNameInput.value?.blur();
}

async function updateVector() {
	if (!vectorFile.value) return;

	try {
		const cleanData = { ...toRaw(vectorFile.value) };
		await upsertVector(cleanData);
		document.title = `${vectorFile.value.name} | Materialvect`;
	} catch (e) {
		console.error('Cloning failed:', e);
	}
}

onMounted(async () => {
	const url = new URL(window.location.href);
	const id = url.pathname.split('/').filter(Boolean).at(-1);
	if (!id) return;

	vectorFile.value = await getVector(id);

	document.title = `${vectorFile.value.name} | Materialvect`;
});
</script>

<template>
	<div v-if="vectorFile !== null" class="editor-wrapper">
		<m3e-app-bar class="app-bar">
			<input
				ref="vectorNameInput"
				slot="title"
				v-model="vectorFile.name"
				class="vector-name"
				@change="updateName()"
			/>
		</m3e-app-bar>
		<div class="editor-area">
			<div class="toolbar"></div>
			<div class="svg-area"></div>
		</div>
	</div>
	<div v-else class="editor-loader">
		<m3e-loading-indicator></m3e-loading-indicator>
		<p>Hang on while we load your vector...</p>
	</div>
</template>

<style scoped>
.editor-wrapper,
.editor-loader {
	width: 100svw;
	height: 100svh;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
}

.editor-loader {
	align-items: center;
	justify-content: center;
}

.app-bar {
	flex-shrink: 0;
}

.editor-area {
	flex-grow: 1;
	display: grid;
	grid-template-columns: 1fr 4fr;
	grid-template-rows: 100%;
}

.toolbar {
	background-color: var(--md-sys-color-surface-container);
	color: var(--md-sys-color-on-surface-container);
}

.vector-name {
	margin-left: 20px;
	border: none;
	outline: none;
	color: var(--md-sys-color-on-surface-container);
	background-color: transparent;
	box-sizing: border-box;
	font-size: 1.2rem;
	width: fit-content;
	border-radius: 10px;
}

.vector-name:hover {
	border: 2px solid var(--md-sys-color-on-surface);
}

.vector-name:focus {
	border: 2px solid var(--md-sys-color-primary);
}
</style>
