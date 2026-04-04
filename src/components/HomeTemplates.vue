<script setup lang="ts">
import TemplateBox from './TemplateBox.vue';
</script>

<template>
	<div class="templates-wrapper">
		<h3>Create a new vector</h3>
		<div class="templates-row">
			<TemplateBox :width="500" :height="500" name="Logo"></TemplateBox>
			<TemplateBox :width="2480" :height="3508" name="A4"></TemplateBox>
		</div>
	</div>
</template>

<style scoped>
.templates-wrapper {
	width: 100%;
	background-color: var(--md-sys-color-surface-container);
	color: var(--md-sys-color-on-surface-container);
	padding: 20px;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	height: 100%;
}

.templates-row {
	display: flex;
	flex-direction: row;
	align-items: stretch;
	justify-content: flex-start;
	gap: 20px;
	height: 100%;
	overflow-x: auto;
	flex: 1;
	padding: 10px 0;
}
</style>
