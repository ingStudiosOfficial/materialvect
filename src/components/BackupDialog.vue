<script setup lang="ts">
import { useGoogle } from '@/composables/google';
import '@m3e/web/dialog';
import { M3eDialogElement } from '@m3e/web/dialog';
import { onMounted, ref, useTemplateRef } from 'vue';
import '@m3e/web/button';
import '@m3e/web/icon';
import { deleteVector, upsertVector } from '@/db';
import { deleteProjectFromDisk, saveProjectToDisk } from '@/utils/filesys';
import { useVectors } from '@/stores/vectors';
import type { Mvct } from '@/interfaces/Mvct';
import { format } from 'date-fns';
import '@m3e/web/progress-indicator';

const vectorsStore = useVectors();

const { openBackupDialogFunction, user, logUserOut, fetchBackedUpVectors } = useGoogle();

const backupDialog = useTemplateRef<M3eDialogElement>('backupDialog');
const conflictVectorRemote = ref<Mvct | null>(null);
const conflictVectorLocal = ref<Mvct | null>(null);
const conflictDialog = useTemplateRef<M3eDialogElement>('conflictDialog');
const conflictResolution = ref<((choice: 'local' | 'remote') => void) | null>(null);
const vectorsLength = ref<number | null>(null);
const restoredVectors = ref<number>(0);
const restoringDialog = useTemplateRef<M3eDialogElement>('restoringDialog');

function openBackupDialog() {
	if (!backupDialog.value) return;

	backupDialog.value.show();
}

function resolveConflict(choice: 'local' | 'remote') {
	if (conflictResolution.value) {
		conflictResolution.value(choice);
		conflictResolution.value = null;
	}
	conflictDialog.value?.hide();
}

async function waitUserChoice(): Promise<'local' | 'remote'> {
	return new Promise((resolve) => {
		conflictResolution.value = resolve;
		conflictDialog.value?.show();
	});
}

async function restoreBackup() {
	restoringDialog.value?.show();

	const vectors = await fetchBackedUpVectors();
	console.log('Vectors:', vectors);

	vectorsLength.value = vectors.length;

	for (const vector of vectors) {
		try {
			console.log('Attempting to save vector:', vector);
			const localVector = vectorsStore.vectors.find(
				(v) => v.metadata.id === vector.metadata.id,
			);
			if (localVector) {
				conflictVectorRemote.value = vector;
				conflictVectorLocal.value = localVector;

				const choice = await waitUserChoice();

				if (choice === 'local') {
					continue;
				} else {
					deleteProjectFromDisk(vector.metadata.id);
					deleteVector(vector.metadata.id);
				}
			}
			saveProjectToDisk(vector);
			upsertVector(vector.metadata);
			await vectorsStore.refreshVectors();
			await vectorsStore.refreshVectorProperties();
			restoredVectors.value += 1;
		} catch (error) {
			console.error('Error while saving vector:', error);
			vectorsLength.value -= 1;
			continue;
		}
	}

	vectorsLength.value = null;
	restoredVectors.value = 0;

	restoringDialog.value?.hide();
	backupDialog.value?.hide();
}

onMounted(() => {
	openBackupDialogFunction.value = openBackupDialog;
});
</script>

<template>
	<div>
		<m3e-dialog ref="backupDialog" dismissible>
			<span slot="header">Google Drive Backup</span>
			<p>Logged in as {{ user?.name }} ({{ user?.email }})</p>
			<div slot="actions" end>
				<m3e-button variant="text" @click="logUserOut()">
					<m3e-icon slot="icon" name="logout"></m3e-icon>
					<m3e-dialog-action>Log out</m3e-dialog-action>
				</m3e-button>
				<m3e-button variant="filled" @click="restoreBackup()">
					<m3e-icon slot="icon" name="backup"></m3e-icon>
					Restore backup
				</m3e-button>
			</div>
		</m3e-dialog>
		<m3e-dialog v-if="conflictVectorLocal && conflictVectorRemote" ref="conflictDialog">
			<span slot="header">Vector Conflict</span>
			<p>
				'{{ conflictVectorRemote?.metadata.name }}' has a local copy. Do you want to keep
				the local copy (modified
				{{ format(conflictVectorLocal.metadata.modified, "do MMMM yyyy 'at' h:mm a") }}) or
				the remote copy (modified
				{{ format(conflictVectorRemote.metadata.modified, "do MMMM yyyy 'at' h:mm a") }})?
			</p>
			<div slot="actions" end>
				<m3e-button variant="tonal" @click="resolveConflict('remote')"
					>Keep remote</m3e-button
				>
				<m3e-button variant="filled" @click="resolveConflict('local')"
					>Keep local</m3e-button
				>
			</div>
		</m3e-dialog>
		<m3e-dialog ref="restoringDialog">
			<span v-if="vectorsLength !== null" slot="header"
				>Restored {{ restoredVectors }} of {{ vectorsLength }} Vectors</span
			>
			<span v-else slot="header">Restoring Vectors...</span>
			<m3e-linear-progress-indicator
				v-if="vectorsLength !== null"
				:value="(restoredVectors / vectorsLength) * 100"
				variant="wavy"
			></m3e-linear-progress-indicator>
			<m3e-linear-progress-indicator
				v-else
				mode="indeterminate"
				variant="wavy"
			></m3e-linear-progress-indicator>
		</m3e-dialog>
	</div>
</template>

<style scoped></style>
