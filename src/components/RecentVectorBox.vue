<script setup lang="ts">
import type { VectorProperties } from '@/interfaces/VectorProperties';
import router from '@/router';
import '@m3e/web/card';

const props = defineProps<VectorProperties>();

function openVector() {
	router.push({ name: 'editor', params: { id: props.id } });
}
</script>

<template>
	<m3e-card class="vector-wrapper" actionable @click="openVector()">
		<div slot="content">
			<p>{{ props.name }}</p>
		</div>
	</m3e-card>
</template>

<style scoped>
.vector-wrapper {
	aspect-ratio: v-bind('props.width') / v-bind('props.height');
	box-sizing: border-box;
	width: auto;
	height: auto;
	flex-shrink: 0;
	--m3e-card-shape: 25px;
	--m3e-filled-card-container-color: var(--md-sys-color-primary-container);
	--m3e-elevated-card-text-color: var(--md-sys-color-on-primary-container);
}
</style>
