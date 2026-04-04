<script setup lang="ts">
import { ref } from 'vue';
import RecentVectorBox from './RecentVectorBox.vue';
import type { VectorProperties } from '@/interfaces/VectorProperties';

const recentVectors = ref<VectorProperties[]>([
	{
		id: window.crypto.randomUUID(),
		name: 'Cool Logo',
		created: Date.now(),
		modified: Date.now(),
		width: 500,
		height: 500,
		synced: false,
	},
]);
</script>

<template>
	<div class="recents-wrapper">
		<h3>Recent vectors</h3>
		<div class="vectors-box">
			<RecentVectorBox
				v-for="vector in recentVectors"
				:key="vector.id"
				v-bind="vector"
			></RecentVectorBox>
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
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	grid-template-rows: auto;
}
</style>
