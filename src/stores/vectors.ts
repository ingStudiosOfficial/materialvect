import { getAllVectors } from '@/db';
import type { VectorFile } from '@/interfaces/VectorFile';
import type { VectorProperties } from '@/interfaces/VectorProperties';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useVectors = defineStore('vectors', () => {
	const vectors = ref<VectorFile[]>([]);
	const vectorsProperties = ref<VectorProperties[]>([]);

	async function refreshVectors() {
		const fetchedVectors = await getAllVectors();
		vectors.value = fetchedVectors;
		vectorsProperties.value = fetchedVectors.map(({ content: _content, ...v }) => v);
	}

	return { vectors, vectorsProperties, refreshVectors };
});
