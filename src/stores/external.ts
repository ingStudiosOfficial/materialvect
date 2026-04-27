import { saveExternalHandle } from '@/db';
import type { Mvct } from '@/interfaces/Mvct';
import { objectToMvct } from '@/utils/mvct';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useExternal = defineStore('file', () => {
	const vector = ref<Mvct | null>(null);
	const fileHandle = ref<FileSystemFileHandle | null>(null);

	async function initialize(externalVector: Mvct, externalHandle: FileSystemFileHandle) {
		await saveExternalHandle(externalHandle, externalVector.metadata.id);

		vector.value = externalVector;
		fileHandle.value = externalHandle;
	}

	async function saveVector(changedVector: Mvct) {
		if (!fileHandle.value) return;

		vector.value = changedVector;

		const mvctFile = await objectToMvct(changedVector);

		const writable = await fileHandle.value.createWritable();
		await writable.write(mvctFile);
		await writable.close();
	}

	return { vector, fileHandle, initialize, saveVector };
});
