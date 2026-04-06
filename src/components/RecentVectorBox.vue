<script setup lang="ts">
import type { VectorProperties } from '@/interfaces/VectorProperties';
import router from '@/router';
import '@m3e/web/card';
import '@m3e/web/icon-button';
import '@m3e/web/icon';
import '@m3e/web/menu';
import '@m3e/web/button';
import { useVectors } from '@/stores/vectors';
import { M3eSnackbar } from '@m3e/web/snackbar';

const props = defineProps<VectorProperties>();

const vectorsStore = useVectors();

function openVector() {
	router.push({ name: 'editor', params: { id: props.id } });
}

async function tryDeleteVector() {
	try {
		await vectorsStore.deleteVector(props.id);
	} catch (error) {
		console.error('Error while deleting vector:', error);
		M3eSnackbar.open((error as Error).message, {
			duration: 0.4,
		});
	}
}
</script>

<template>
	<div class="vector-wrapper">
		<m3e-card class="vector-card" actionable @click.stop="openVector()">
			<div slot="content">
				<p class="vector-name">{{ props.name }}</p>
			</div>
		</m3e-card>
		<m3e-icon-button class="more-btn">
			<m3e-menu-trigger :for="`more-menu-${props.id}`"></m3e-menu-trigger>
			<m3e-icon name="more_vert"></m3e-icon>
		</m3e-icon-button>
		<m3e-menu :id="`more-menu-${props.id}`" position-x="before" ref="menuRef">
			<!--<m3e-menu-item><m3e-icon slot="icon" name="edit"></m3e-icon>Rename</m3e-menu-item>
			<m3e-menu-item><m3e-icon slot="icon" name="content_copy"></m3e-icon>Copy</m3e-menu-item>-->
			<m3e-menu-item @click.stop="tryDeleteVector()"
				><m3e-icon slot="icon" name="delete"></m3e-icon>Delete</m3e-menu-item
			>
		</m3e-menu>
	</div>
</template>

<style scoped>
.vector-wrapper {
	position: relative;
	box-sizing: border-box;
	width: 200px;
	height: 200px;
	flex-shrink: 0;
	overflow: hidden;
}

.vector-card {
	position: relative;
	--m3e-card-shape: 25px;
	--m3e-filled-card-container-color: var(--md-sys-color-secondary-container);
	--m3e-elevated-card-text-color: var(--md-sys-color-on-secondary-container);
	overflow: hidden;
	width: 100%;
	height: 100%;
}

.vector-name {
	width: 100%;
	text-overflow: ellipsis;
	word-break: break-all;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	line-clamp: 3;
	-webkit-box-orient: vertical;
}

.more-btn {
	position: absolute;
	bottom: 10px;
	right: 10px;
	z-index: 100;
}

@media (max-width: 768px) {
	.vector-wrapper {
		width: 100%;
	}
}
</style>
