<script setup lang="ts">
import type { VectorProperties } from '@/interfaces/VectorProperties';
import '@m3e/web/loading-indicator';
import { onMounted, reactive } from 'vue';

const vectorData = reactive<Partial<VectorProperties>>({});

onMounted(() => {
	const urlParams = new URLSearchParams(window.location.search);

	const name = urlParams.get('name');
	const width = urlParams.get('width');
	const height = urlParams.get('height');

	vectorData.name = name || 'Untitled Vector';
	vectorData.id = window.crypto.randomUUID();
	vectorData.created = Date.now();
	vectorData.modified = Date.now();
	vectorData.synced = false;

	const isNum = (val: string) => !isNaN(Number(val)) && val.trim() !== '';

	if (width && isNum(width)) vectorData.width = Number(width);
	else vectorData.width = 500;
	if (height && isNum(height)) vectorData.height = Number(height);
	else vectorData.height = 500;
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
