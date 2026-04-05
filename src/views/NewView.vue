<script setup lang="ts">
import { upsertVector } from '@/db';
import type { Mvct } from '@/interfaces/Mvct';
import type { VectorProperties } from '@/interfaces/VectorProperties';
import router from '@/router';
import { saveProjectToDisk } from '@/utils/filesys';
import '@m3e/web/loading-indicator';
import { onMounted } from 'vue';

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

	const vectorFile: Mvct = {
		metadata: vectorProperties,
		svg: '',
		css: '',
		js: '',
		assets: {
			images: [],
			fonts: [],
		},
	};

	await saveProjectToDisk(vectorFile);
	await upsertVector(vectorProperties);

	router.replace({ name: 'editor', params: { id: vectorProperties.id } });
});
</script>

<template>
	<div class="new-wrapper">
		<m3e-loading-indicator></m3e-loading-indicator>
		<p>Creating your vector...</p>
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
</style>
