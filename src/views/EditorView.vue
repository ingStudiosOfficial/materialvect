<script setup lang="ts">
import { upsertVector } from '@/db';
import type { Mvct } from '@/interfaces/Mvct';
import { fetchProjectFromDisk, saveProjectToDisk, verifyAccessAndFetch } from '@/utils/filesys';
import '@m3e/web/app-bar';
import '@m3e/web/form-field';
import '@m3e/web/loading-indicator';
import { M3eSnackbar } from '@m3e/web/snackbar';
import '@m3e/web/button';
import '@m3e/web/menu';
import '@m3e/web/icon';
import { nextTick, onMounted, ref, toRaw, useTemplateRef } from 'vue';
import EditorArea from '@/components/EditorArea.vue';
import ElementInspector from '@/components/ElementInspector.vue';
import router from '@/router';
import { useEditor } from '@/stores/editor';

const editorStore = useEditor();

const vectorId = ref<string>('');
const vectorFile = ref<Mvct | null>(null);
const vectorNameInput = useTemplateRef<HTMLInputElement>('vectorNameInput');
const needAccess = ref<boolean>(false);

async function updateName() {
	await updateVector();
	await nextTick();
	vectorNameInput.value?.blur();
}

async function updateVectorFromEditorArea(vector: Mvct) {
	console.log('Saving vector:', vector);
	vectorFile.value = vector;
	updateVector();
}

async function updateVector() {
	if (!vectorFile.value) return;

	try {
		vectorFile.value.metadata.modified = Date.now();
		const cleanData = { ...toRaw(vectorFile.value) };
		await saveProjectToDisk(cleanData);
		await upsertVector(cleanData.metadata);
		document.title = `${cleanData.metadata.name} | Materialvect`;
		console.log('Successfully saved vector.');
	} catch (e) {
		console.error('Cloning failed:', e);
	}
}

async function saveVector() {
	await updateVector();
	M3eSnackbar.open('Successfully saved vector', {
		duration: 4000,
	});
}

async function createNewVector() {
	await saveVector();
	router.push({ name: 'new' });
}

async function retryFetchProject() {
	try {
		const project = await verifyAccessAndFetch(vectorId.value);
		vectorFile.value = project;
	} catch (error) {
		M3eSnackbar.open((error as Error).message, {
			duration: 0.4,
		});
	}
}

onMounted(async () => {
	const url = new URL(window.location.href);
	const id = url.pathname.split('/').filter(Boolean).at(-1);
	if (!id) return;
	vectorId.value = id;

	try {
		vectorFile.value = await fetchProjectFromDisk(id);
	} catch (error) {
		console.error('Error while fetching vector file:', error);

		if ((error as Error).name === 'NotAllowedError') {
			needAccess.value = true;
		} else {
			M3eSnackbar.open((error as Error).message, {
				duration: 0.4,
			});
		}
	}

	document.title = `${vectorFile.value?.metadata.name || 'Untitled Vector'} | Materialvect`;

	document.addEventListener('keydown', (event) => {
		if (event.ctrlKey && event.key === 's') {
			event.preventDefault();
			saveVector();
		}
	});
});
</script>

<template>
	<div v-if="vectorFile !== null" class="editor-wrapper">
		<m3e-app-bar class="app-bar">
			<div slot="title" class="app-bar-title">
				<input
					ref="vectorNameInput"
					slot="title"
					v-model="vectorFile.metadata.name"
					class="vector-name"
					@change="updateName()"
				/>

				<m3e-button variant="text">
					<m3e-menu-trigger for="file-menu">File</m3e-menu-trigger>
				</m3e-button>
				<m3e-button variant="text">
					<m3e-menu-trigger for="insert-menu">Insert</m3e-menu-trigger>
				</m3e-button>

				<m3e-menu id="file-menu">
					<m3e-menu-item @click="createNewVector()">
						<m3e-icon slot="icon" name="add"></m3e-icon>
						Create
					</m3e-menu-item>
					<m3e-menu-item @click="saveVector()">
						<m3e-icon slot="icon" name="save"></m3e-icon>
						Save
					</m3e-menu-item>
				</m3e-menu>

				<m3e-menu id="insert-menu">
					<m3e-menu-item>
						<m3e-icon slot="icon" name="shapes"></m3e-icon>
						<m3e-menu-trigger for="insert-shape-menu">Shape</m3e-menu-trigger>
					</m3e-menu-item>
				</m3e-menu>
				<m3e-menu id="insert-shape-menu">
					<m3e-menu-item @click="editorStore.createShape('rect')">
						Rectangle
					</m3e-menu-item>
					<m3e-menu-item @click="editorStore.createShape('circle')">
						Circle
					</m3e-menu-item>
					<m3e-menu-item @click="editorStore.createShape('ellipse')">
						Ellipse
					</m3e-menu-item>
				</m3e-menu>
			</div>
		</m3e-app-bar>
		<div class="editor-components">
			<ElementInspector class="toolbar"></ElementInspector>
			<EditorArea
				:vector="vectorFile"
				class="svg-area"
				@change="updateVectorFromEditorArea"
			></EditorArea>
		</div>
	</div>
	<div v-else-if="vectorFile === null && needAccess === false" class="editor-loader">
		<m3e-loading-indicator></m3e-loading-indicator>
		<p>Hang on while we load your vector...</p>
	</div>
	<div v-else-if="vectorFile === null && needAccess === true" class="editor-loader">
		<p class="access-prompt">
			Materialvect needs you to allow us to access your file system to load your vector.
		</p>
		<m3e-button variant="filled" @click="retryFetchProject()">Allow</m3e-button>
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

.editor-components {
	flex-grow: 1;
	display: grid;
	grid-template-columns: 1fr 4fr;
	box-sizing: border-box;
}

.toolbar {
	height: 100%;
}

.svg-area {
	height: 100%;
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
	field-sizing: content;
	max-width: 20%;
}

.vector-name:hover {
	border: 2px solid var(--md-sys-color-on-surface);
}

.vector-name:focus {
	border: 2px solid var(--md-sys-color-primary);
}

.access-prompt {
	text-align: center;
}

.app-bar-title {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	gap: 10px;
}
</style>
