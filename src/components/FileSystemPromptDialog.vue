<script setup lang="ts">
import { useFileSystem } from '@/stores/filesys';
import '@m3e/web/dialog';
import '@m3e/web/button';
import { M3eDialogElement } from '@m3e/web/dialog';
import { onMounted, useTemplateRef } from 'vue';

const fileSystemStore = useFileSystem();

const promptDialog = useTemplateRef<M3eDialogElement>('promptDialog');

function openDialog() {
	if (!promptDialog.value) return;

	promptDialog.value.show();
}

function onAllow() {
	if (!fileSystemStore.onAllowFunction) return;

	fileSystemStore.onAllowFunction();
}

function onClose() {
	fileSystemStore.onAllowFunction = null;
	fileSystemStore.allowMessage = null;
}

onMounted(() => {
	fileSystemStore.openFileDialogFunction = openDialog;
});
</script>

<template>
	<m3e-dialog ref="promptDialog" @closed="onClose">
		<span slot="header">File system access required</span>
		<p>
			{{
				fileSystemStore.allowMessage ||
				'Materialvect needs you to allow us to access your file system.'
			}}
		</p>
		<div slot="actions" end>
			<m3e-button variant="text"><m3e-dialog-action>Deny</m3e-dialog-action></m3e-button>
			<m3e-button variant="filled" @click="onAllow">
				<m3e-dialog-action>Allow</m3e-dialog-action>
			</m3e-button>
		</div>
	</m3e-dialog>
</template>

<style scoped></style>
