<script setup lang="ts">
import { upsertVector } from '@/db';
import type { VectorFile } from '@/interfaces/VectorFile';
import router from '@/router';
import '@m3e/web/loading-indicator';
import { onMounted } from 'vue';

onMounted(async () => {
	const urlParams = new URLSearchParams(window.location.search);

	const id = window.crypto.randomUUID();
	const name = urlParams.get('name') || 'Untitled Vector';
	const width = urlParams.get('width');
	const height = urlParams.get('height');
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

	const vectorFile: VectorFile = {
		id,
		name,
		width: vcWidth,
		height: vcHeight,
		created,
		modified,
		synced,
		content: '',
	};

	await upsertVector(vectorFile);

	router.push({ name: 'editor', params: { id: vectorFile.id } });
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
