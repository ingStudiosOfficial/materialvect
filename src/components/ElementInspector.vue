<script setup lang="ts">
import { useInspector } from '@/stores/inspector';
import { storeToRefs } from 'pinia';

const inspectorStore = useInspector();
const inspectorProperties = storeToRefs(inspectorStore);
</script>

<template>
	<div
		v-if="inspectorProperties.activeElement.value"
		class="inspector-wrapper"
		ref="inspector"
		tabindex="0"
	>
		<h4>Element Inspector</h4>
		<input
			class="inspector-input"
			:value="inspectorProperties.activeElement.value.x()"
			@input="inspectorStore.setElementX"
		/>
	</div>
	<div v-else class="inspector-wrapper">
		<p>No element selected.</p>
	</div>
</template>

<style scoped>
.inspector-wrapper {
	background-color: var(--md-sys-color-surface-container);
	color: var(--md-sys-color-on-secondary-container);
	border-radius: 0 25px 25px 0;
	box-sizing: border-box;
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;
}

.inspector-input {
	width: 100%;
}
</style>
