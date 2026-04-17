<script setup lang="ts">
import { upsertVector } from '@/db';
import type { Mvct } from '@/interfaces/Mvct';
import type { VectorProperties } from '@/interfaces/VectorProperties';
import router from '@/router';
import { saveProjectToDisk, verifyAccessAndCreate } from '@/utils/filesys';
import { generateCss, generateTheme } from '@/utils/theme';
import '@m3e/web/loading-indicator';
import { M3eSnackbar } from '@m3e/web/snackbar';
import { onMounted, ref, toRaw } from 'vue';

const needAccess = ref<boolean>(false);
const projectToCreate = ref<Mvct | null>(null);

async function retryCreateProject() {
	if (!projectToCreate.value) return;

	try {
		await verifyAccessAndCreate(projectToCreate.value);
		await upsertVector(toRaw(projectToCreate.value.metadata));
		router.replace({ name: 'editor', params: { id: projectToCreate.value.metadata.id } });
	} catch (error) {
		M3eSnackbar.open((error as Error).message, {
			duration: 0.4,
		});
	}
}

onMounted(async () => {
	const urlParams = new URLSearchParams(window.location.search);

	const id = window.crypto.randomUUID();
	const name = decodeURIComponent(urlParams.get('name') || 'Untitled%20Vector');
	const width = decodeURIComponent(urlParams.get('width') || '500');
	const height = decodeURIComponent(urlParams.get('height') || '500');
	const created = Date.now();
	const modified = Date.now();
	const synced = false;

	const isNum = (val: string) => !isNaN(Number(val)) && val.trim() !== '';

	let vcWidth: number;
	let vcHeight: number;

	if (width && isNum(width)) vcWidth = Number(width);
	else vcWidth = 500;
	if (height && isNum(height)) vcHeight = Number(height);
	else vcHeight = 500;

	const vectorProperties: VectorProperties = {
		id,
		name,
		width: vcWidth,
		height: vcHeight,
		created,
		modified,
		synced,
	};

	const theme = generateTheme('#CBA9FF');

	const vectorFile: Mvct = {
		metadata: vectorProperties,
		svg: '',
		css: generateCss(theme),
		js: '',
		theme: theme,
		assets: {
			images: [],
			fonts: [],
		},
	};

	try {
		await saveProjectToDisk(vectorFile);
		await upsertVector(vectorProperties);
		router.replace({ name: 'editor', params: { id: vectorProperties.id } });
	} catch (error) {
		if ((error as Error).name === 'NotAllowedError') {
			needAccess.value = true;
			projectToCreate.value = vectorFile;
		} else {
			M3eSnackbar.open((error as Error).message, {
				duration: 0.4,
			});
		}
	}
});
</script>

<template>
	<div class="new-wrapper">
		<div v-if="needAccess === false" class="new-loader">
			<m3e-loading-indicator></m3e-loading-indicator>
			<p>Creating your vector...</p>
		</div>
		<div v-else class="new-loader">
			<p class="access-prompt">
				Materialvect needs you to allow us to access your file system to create your vector.
			</p>
			<m3e-button variant="filled" @click="retryCreateProject()">Allow</m3e-button>
		</div>
	</div>
</template>

<style scoped>
.new-wrapper {
	width: 100svw;
	height: 100svh;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.new-loader {
	width: 100svw;
	height: 100svh;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.access-prompt {
	text-align: center;
}
</style>
