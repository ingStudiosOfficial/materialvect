<script setup lang="ts">
import '@m3e/web/app-bar';
import '@m3e/web/fab';
import '@m3e/web/fab-menu';
import '@m3e/web/icon';
import '@m3e/web/chips';
import '@m3e/web/dialog';
import '@m3e/web/button';
import { ref, useTemplateRef } from 'vue';
import HomeTemplates from '@/components/HomeTemplates.vue';
import RecentVectors from '@/components/RecentVectors.vue';
import { createNewVector } from '@/utils/vector';
import { saveProjectToDisk, selectProjectFolder } from '@/utils/filesys';
import { mvctToObject } from '@/utils/mvct';
import { useVectors } from '@/stores/vectors';
import { upsertVector } from '@/db';
import type { M3eDialogElement } from '@m3e/web/dialog';
import router from '@/router';

const vectorsStore = useVectors();

const hiddenUpload = useTemplateRef<HTMLInputElement>('hiddenUpload');
const isBeta = ref<boolean>(import.meta.env.VITE_IS_BETA === 'true');
const permissionDialog = useTemplateRef<M3eDialogElement>('permissionDialog');

let needsDirectory = false;

async function onVectorUpload() {
	if (needsDirectory) permissionDialog.value?.hide();

	const files = hiddenUpload.value?.files;

	if (!files || files.length === 0 || !files[0]) return;

	const file = files[0];

	try {
		const mvctObject = await mvctToObject(file);
		if (needsDirectory) await selectProjectFolder();
		await saveProjectToDisk(mvctObject);
		await upsertVector(mvctObject.metadata);
		await vectorsStore.refreshVectors();
		await vectorsStore.refreshVectorProperties();
		M3eSnackbar.open(`Successfully loaded '${mvctObject.metadata.name}'`, {
			duration: 4000,
		});
	} catch (error) {
		if ((error as Error).message === 'Directory handle missing') {
			needsDirectory = true;
			permissionDialog.value?.show();
		} else {
			M3eSnackbar.open((error as Error).message, {
				duration: 4000,
			});
		}
	}
}
</script>

<template>
	<div class="home-wrapper">
		<m3e-app-bar class="app-bar">
			<div slot="title" class="app-bar-title">
				<button class="mvct-logo" @click="router.push('/')">
					<img src="/materialvect_logo_trans_full.png" class="mvct-logo-image" />
				</button>
				<span>Materialvect</span>
				<m3e-chip v-if="isBeta" style="--m3e-chip-container-shape: 25px">BETA</m3e-chip>
			</div>
		</m3e-app-bar>
		<m3e-fab size="large" class="create-fab">
			<m3e-fab-menu-trigger for="create-menu">
				<m3e-icon name="add"></m3e-icon>
			</m3e-fab-menu-trigger>
		</m3e-fab>

		<div class="main-content">
			<HomeTemplates class="home-templates"></HomeTemplates>
			<RecentVectors class="recent-vectors"></RecentVectors>
		</div>

		<m3e-dialog dismissible ref="permissionDialog">
			<span slot="header">File system access denied</span>
			Materialvect needs you to select a directory to store your vector.
			<div slot="actions" end>
				<m3e-button variant="filled" autofocus @click="onVectorUpload()">Select</m3e-button>
			</div>
		</m3e-dialog>

		<m3e-fab-menu id="create-menu">
			<m3e-fab-menu-item @click="createNewVector()">
				<m3e-icon slot="icon" name="add"></m3e-icon>
				Create
			</m3e-fab-menu-item>
			<m3e-fab-menu-item @click="hiddenUpload?.click()">
				<m3e-icon slot="icon" name="upload_file"></m3e-icon>
				Upload
			</m3e-fab-menu-item>
		</m3e-fab-menu>
		<input
			ref="hiddenUpload"
			class="hidden-upload"
			type="file"
			accept=".mvct"
			@input="onVectorUpload()"
		/>
	</div>
</template>

<style scoped>
.home-wrapper {
	width: 100svw;
	height: 100svh;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
}

.create-fab {
	position: fixed;
	bottom: 25px;
	right: 25px;
	z-index: 1000;
}

.hidden-upload {
	display: none;
}

.app-bar {
	flex-shrink: 0;
	box-sizing: border-box;
}

.main-content {
	display: grid;
	grid-template-columns: 100%;
	grid-template-rows: min-content 1fr;
	flex-grow: 1;
}

.home-templates {
	height: 100%;
}

.recent-vectors {
	height: 100%;
}

.app-bar-title {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	gap: 10px;
}
</style>
