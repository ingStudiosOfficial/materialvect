<script setup lang="ts">
import { onMounted } from 'vue';
import RecentVectorBox from './RecentVectorBox.vue';
import { useVectors } from '@/stores/vectors';

const vectorsStore = useVectors();

onMounted(async () => {
	await vectorsStore.refreshVectors();
});
</script>

<template>
	<div class="recents-wrapper">
		<h3>Recent vectors</h3>
		<div class="vectors-box">
			<RecentVectorBox
				v-for="vector in vectorsStore.vectorsProperties"
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
	gap: 20px;
}
</style>
