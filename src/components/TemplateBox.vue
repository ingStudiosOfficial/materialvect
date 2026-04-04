<script setup lang="ts">
import '@m3e/web/card';

interface ComponentProps {
	width: number;
	height: number;
	name: string;
}

const props = defineProps<ComponentProps>();
</script>

<template>
	<m3e-card class="template-box" actionable variant="filled">
		<div class="box-content" slot="content">
			<p class="template-name">{{ props.name }}</p>
			<p>{{ props.width }}px x {{ props.height }}px</p>
		</div>
	</m3e-card>
</template>

<style scoped>
.template-box {
	aspect-ratio: v-bind('props.width') / v-bind('props.height');
	box-sizing: border-box;
	width: auto;
	height: 100%;
	flex-shrink: 0;
	--m3e-card-shape: 25px;
	--m3e-filled-card-container-color: var(--md-sys-color-primary-container);
	--m3e-elevated-card-text-color: var(--md-sys-color-on-primary-container);
}

.template-name {
	font-weight: bold;
}
</style>
