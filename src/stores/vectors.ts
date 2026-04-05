import { getAllVectors } from '@/db';
import type { Mvct } from '@/interfaces/Mvct';
import type { VectorProperties } from '@/interfaces/VectorProperties';
import { fetchProjectsFromDisk, verifyFolderAccess } from '@/utils/filesys';
import { defineStore } from 'pinia';
import { onMounted, ref } from 'vue';
import { M3eSnackbar } from '@m3e/web/snackbar';

export const useVectors = defineStore('vectors', () => {
	const vectors = ref<Mvct[]>([]);
	const vectorsProperties = ref<VectorProperties[]>([]);
	const canAccessFolder = ref<boolean>(false);

	async function refreshVectorProperties() {
		const fetchedVectors = await getAllVectors();
		vectorsProperties.value = fetchedVectors;
	}

	async function refreshVectors() {
		try {
			vectors.value = await fetchProjectsFromDisk();
			canAccessFolder.value = true;
		} catch (error) {
			console.error('Error while fetching vectors:', error);
			M3eSnackbar.open((error as Error).message, {
				duration: 0.4,
			});
		}
	}

	onMounted(async () => {
		canAccessFolder.value = await verifyFolderAccess();
	});

	return { vectors, vectorsProperties, canAccessFolder, refreshVectors, refreshVectorProperties };
});
