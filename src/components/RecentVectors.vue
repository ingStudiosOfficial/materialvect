<script setup lang="ts">
import { onMounted } from 'vue';
import RecentVectorBox from './RecentVectorBox.vue';
import { useVectors } from '@/stores/vectors';
import '@m3e/web/button';
import '@m3e/web/icon';

const vectorsStore = useVectors();

onMounted(async () => {
	await vectorsStore.refreshVectorProperties();
});
</script>

<template>
	<div class="recents-wrapper">
		<h3>Recent vectors</h3>
		<div v-if="vectorsStore.vectorsProperties.length !== 0" class="vectors-box">
			<RecentVectorBox
				v-for="vector in vectorsStore.vectorsProperties"
				:key="vector.id"
				v-bind="vector"
			></RecentVectorBox>
		</div>
		<div
			v-else-if="vectorsStore.vectorsProperties.length === 0 && vectorsStore.canAccessFolder"
		>
			<p>No vectors found. Your recent vectors will be stored here.</p>
		</div>
		<div
			v-else-if="vectorsStore.vectorsProperties.length === 0 && !vectorsStore.canAccessFolder"
			class="no-vectors"
		>
			<p>No vectors found. Choose a directory to store your vectors.</p>
			<m3e-button variant="tonal" @click="vectorsStore.refreshVectors()">
				<m3e-icon slot="icon" name="folder"></m3e-icon>
				Choose directory
			</m3e-button>
		</div>
	</div>
</template>

<style scoped>
.recents-wrapper {
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	padding: 20px;
}

.vectors-box {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	gap: 20px;
}

@media (max-width: 768px) {
	.vectors-box {
		flex-direction: column;
		align-items: stretch;
	}
}
</style>
