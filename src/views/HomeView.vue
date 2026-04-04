<script setup lang="ts">
import '@m3e/web/app-bar';
import '@m3e/web/fab';
import '@m3e/web/fab-menu';
import '@m3e/web/icon';
import { useTemplateRef } from 'vue';
import HomeTemplates from '@/components/HomeTemplates.vue';
import RecentVectors from '@/components/RecentVectors.vue';
import router from '@/router';

const hiddenUpload = useTemplateRef('hiddenUpload');
</script>

<template>
	<div class="home-wrapper">
		<m3e-app-bar class="app-bar">
			<span slot="title" style="margin-left: 20px">Materialvect</span>
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

		<m3e-fab-menu id="create-menu">
			<m3e-fab-menu-item @click="router.push('/new')">
				<m3e-icon slot="icon" name="add"></m3e-icon>
				Create
			</m3e-fab-menu-item>
			<m3e-fab-menu-item @click="hiddenUpload?.click()">
				<m3e-icon slot="icon" name="upload_file"></m3e-icon>
				Upload
			</m3e-fab-menu-item>
		</m3e-fab-menu>
		<input ref="hiddenUpload" class="hidden-upload" type="file" accept=".mvct" />
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
</style>
