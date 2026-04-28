<script setup lang="ts">
import { getExternalHandle, upsertVector } from '@/db';
import type { Mvct } from '@/interfaces/Mvct';
import { fetchProjectFromDisk, saveProjectToDisk, verifyAccessAndFetch } from '@/utils/filesys';
import '@m3e/web/app-bar';
import '@m3e/web/form-field';
import '@m3e/web/loading-indicator';
import { M3eSnackbar } from '@m3e/web/snackbar';
import '@m3e/web/button';
import '@m3e/web/menu';
import '@m3e/web/icon';
import '@m3e/web/icon-button';
import '@m3e/web/tooltip';
import '@m3e/web/split-pane';
import { computed, nextTick, onMounted, onUnmounted, ref, toRaw, useTemplateRef } from 'vue';
import EditorArea from '@/components/EditorArea.vue';
import ElementInspector from '@/components/ElementInspector.vue';
import router from '@/router';
import { useEditor } from '@/stores/editor';
import ThemeDialog from '@/components/ThemeDialog.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import { useFileSystem } from '@/stores/filesys';
import { useMobile } from '@/composables/mobile';
import FontPicker from '@/components/FontPicker.vue';
import { exportAsMvct, exportAsPng, exportAsSvg } from '@/utils/export';
import { format, isToday, isYesterday } from 'date-fns';
import { useRoute } from 'vue-router';
import { useExternal } from '@/stores/external';
import { mvctToObject } from '@/utils/mvct';

const editorStore = useEditor();
const fileSystemStore = useFileSystem();
const externalStore = useExternal();

const { isMobile } = useMobile();

const route = useRoute();

const vectorId = ref<string>('');
const vectorFile = ref<Mvct | null>(null);
const vectorNameInput = useTemplateRef<HTMLInputElement>('vectorNameInput');
const needAccess = ref<boolean>(false);
const hiddenImageInput = useTemplateRef<HTMLInputElement>('hiddenImageInput');
const isSaving = ref<boolean>(false);
const editingExternal = ref<boolean>(false);

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

async function updateVector(notBackgroundSave: boolean = false) {
	if (!vectorFile.value) return;

	try {
		isSaving.value = true;
		vectorFile.value.metadata.modified = Date.now();
		const cleanData = { ...toRaw(vectorFile.value) };

		if (editingExternal.value) {
			await externalStore.saveVector(vectorFile.value);
		} else {
			await saveProjectToDisk(cleanData);
			await upsertVector(cleanData.metadata);
		}

		document.title = `${cleanData.metadata.name} | Materialvect`;
		console.log('Successfully saved vector.');
	} catch (error) {
		console.error('Saving failed:', error);

		if (notBackgroundSave) {
			const saveError = error as Error;

			if (saveError.name === 'NotAllowedError') {
				if (fileSystemStore.openFileDialogFunction) {
					fileSystemStore.onAllowFunction = updateVector;
					console.log('Set on allow function:', fileSystemStore.onAllowFunction);
					fileSystemStore.allowMessage =
						'Materialvect needs you to allow us to access your file system to save your vector.';
					fileSystemStore.openFileDialogFunction();
				}
			}
		}
	} finally {
		isSaving.value = false;
	}
}

async function updateVectorSb() {
	await updateVector(true);
	M3eSnackbar.open('Successfully saved vector', {
		duration: 4000,
	});
}

function createNewVector() {
	updateVector();
	router.push({ name: 'new' });
}

async function retryFetchProject() {
	try {
		const project = await verifyAccessAndFetch(vectorId.value);
		vectorFile.value = project;
	} catch (error) {
		M3eSnackbar.open((error as Error).message, {
			duration: 4000,
		});
	}
}

function openThemeDialog() {
	if (editorStore.openThemeFunction === null) return;

	editorStore.openThemeFunction();
}

function navigateToHome() {
	updateVector();
	router.push('/');
}

function handleImageUpload() {
	const files = hiddenImageInput.value?.files;
	if (!files || files.length === 0 || !files[0]) return;

	const imageFile = files[0];

	editorStore.uploadImage(imageFile);
}

async function onKeyUp(event: KeyboardEvent) {
	const eventKey = event.key.toLowerCase();

	if ((event.ctrlKey || event.metaKey) && eventKey === 's') {
		event.preventDefault();
		updateVectorSb();
	} else if ((event.ctrlKey || event.metaKey) && eventKey === 'v') {
		editorStore.onPaste();
	}
}

const lastSaved = computed(() => {
	if (isToday(editorStore.lastSaved)) return format(editorStore.lastSaved, "'today at' h:mm a");
	else if (isYesterday(editorStore.lastSaved))
		return format(editorStore.lastSaved, "'yesterday at' h:mm a");
	else return format(editorStore.lastSaved, 'do MMMM yyyy');
});

onMounted(async () => {
	if (route.query.local) {
		let file = externalStore.vector;
		if (!file) {
			console.log('File is null.');

			const id = route.params.id as string | undefined;
			if (!id) {
				console.error('ID is undefined.');
				return;
			}

			const handle = (await getExternalHandle(id))?.handle;
			if (!handle) {
				console.error('Failed to get external handle.');
				return;
			}

			console.log('Found handle:', handle);

			const vectorFile = await handle.getFile();
			file = await mvctToObject(vectorFile);

			await externalStore.initialize(file, handle);
		}

		editingExternal.value = true;

		vectorFile.value = file;

		return;
	}

	const id = route.params.id as string | undefined;
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
				duration: 4000,
			});
		}
	}

	document.title = `${vectorFile.value?.metadata.name || 'Untitled Vector'} | Materialvect`;

	document.addEventListener('keydown', onKeyUp);
});

onUnmounted(() => {
	document.removeEventListener('keydown', onKeyUp);
});
</script>

<template>
	<div v-if="vectorFile !== null" class="editor-wrapper">
		<m3e-app-bar class="app-bar">
			<div slot="title" class="app-bar-actions">
				<button class="mvct-logo" @click="router.push('/')">
					<img src="/materialvect_logo_trans_full.png" class="mvct-logo-image" />
				</button>
				<input
					ref="vectorNameInput"
					slot="title"
					v-model="vectorFile.metadata.name"
					class="vector-name"
					@change="updateName()"
				/>

				<div class="primary-actions">
					<m3e-button variant="text">
						<m3e-menu-trigger for="file-menu">File</m3e-menu-trigger>
					</m3e-button>
					<m3e-button variant="text">
						<m3e-menu-trigger for="insert-menu">Insert</m3e-menu-trigger>
					</m3e-button>
					<m3e-button variant="text">
						<m3e-menu-trigger for="theme-menu">Theme</m3e-menu-trigger>
					</m3e-button>
				</div>

				<m3e-menu id="file-menu">
					<m3e-menu-item @click="navigateToHome()">
						<m3e-icon slot="icon" name="home"></m3e-icon>
						Home
					</m3e-menu-item>
					<m3e-menu-item @click="createNewVector()">
						<m3e-icon slot="icon" name="add"></m3e-icon>
						Create
					</m3e-menu-item>
					<m3e-menu-item @click="updateVectorSb()">
						<m3e-icon slot="icon" name="save"></m3e-icon>
						Save
					</m3e-menu-item>
				</m3e-menu>

				<m3e-menu id="insert-menu">
					<m3e-menu-item>
						<m3e-icon slot="icon" name="shapes"></m3e-icon>
						<m3e-menu-trigger for="insert-shape-menu">Shape</m3e-menu-trigger>
					</m3e-menu-item>
					<m3e-menu-item @click="editorStore.createText()">
						<m3e-icon slot="icon" name="text_fields"></m3e-icon>
						Text
					</m3e-menu-item>
					<m3e-menu-item @click="hiddenImageInput?.click()">
						<m3e-icon slot="icon" name="image"></m3e-icon>
						Image
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

				<m3e-menu id="theme-menu">
					<m3e-menu-item @click="openThemeDialog()">
						<m3e-icon slot="icon" name="colors"></m3e-icon>
						Edit theme
					</m3e-menu-item>
				</m3e-menu>

				<m3e-icon-button v-show="!isSaving" id="save-status">
					<m3e-icon name="folder_check"></m3e-icon>
				</m3e-icon-button>

				<div class="saving" v-show="isSaving">
					<m3e-icon-button id="saving-status">
						<m3e-icon name="autorenew"></m3e-icon>
					</m3e-icon-button>
					<p class="saving-text">Saving...</p>
				</div>

				<m3e-rich-tooltip for="save-status">
					<span slot="subhead">Last saved {{ lastSaved }}</span>
					This vector is stored locally.
				</m3e-rich-tooltip>
				<m3e-rich-tooltip for="saving-status">
					<span slot="subhead">Saving vector</span>
					This vector is stored locally.
				</m3e-rich-tooltip>
			</div>
			<div slot="trailing" class="app-bar-actions" style="margin-right: 10px">
				<m3e-button variant="tonal">
					<m3e-icon slot="icon" name="share"></m3e-icon>
					<m3e-menu-trigger for="export-menu">Export</m3e-menu-trigger>
				</m3e-button>

				<m3e-menu id="export-menu">
					<m3e-menu-item @click="exportAsMvct(vectorFile)">
						<m3e-icon slot="icon" name="folder_zip"></m3e-icon>
						Materialvect Vector (.mvct)
					</m3e-menu-item>
					<m3e-menu-item @click="exportAsSvg(vectorFile)">
						<m3e-icon slot="icon" name="code_xml"></m3e-icon>
						Scalable Vector Graphics (.svg)
					</m3e-menu-item>
					<m3e-menu-item @click="exportAsPng(vectorFile)">
						<m3e-icon slot="icon" name="file_png"></m3e-icon>
						Portable Network Graphics (.png)
					</m3e-menu-item>
				</m3e-menu>
			</div>
		</m3e-app-bar>
		<m3e-split-pane
			class="editor-components"
			:value="isMobile ? 50 : 20"
			:orientation="isMobile ? 'vertical' : 'horizontal'"
			min="0"
			max="100"
		>
			<ElementInspector :slot="isMobile ? 'end' : 'start'" class="toolbar"></ElementInspector>
			<EditorArea
				:slot="isMobile ? 'start' : 'end'"
				:vector="vectorFile"
				class="svg-area"
				@change="updateVectorFromEditorArea"
			></EditorArea>
		</m3e-split-pane>
		<ThemeDialog></ThemeDialog>
		<ColorPicker @input="editorStore.changeColor"></ColorPicker>
		<FontPicker></FontPicker>
		<input
			type="file"
			class="hidden-image-input"
			ref="hiddenImageInput"
			accept="image/*"
			@input="handleImageUpload()"
		/>
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
	overflow-y: hidden;
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
	box-sizing: border-box;
}

.editor-components {
	flex-grow: 1;
	box-sizing: border-box;
	min-height: 0;
	display: flex;
	position: relative;
}

.toolbar {
	height: 100%;
	min-width: 0;
	min-height: 0;
}

.svg-area {
	height: 100%;
	min-width: 0;
	min-height: 0;
}

.vector-name {
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

.app-bar-actions {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	gap: 10px;
}

.hidden-image-input {
	display: none;
}

.saving-text {
	font-size: 0.8rem;
}

.saving {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	gap: 2px;
}

.primary-actions {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
}
</style>
