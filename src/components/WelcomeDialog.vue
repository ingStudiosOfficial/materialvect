<script setup lang="ts">
import { useWelcome } from '@/composables/welcome';
import '@m3e/web/dialog';
import { M3eDialogElement } from '@m3e/web/dialog';
import { onMounted, useTemplateRef } from 'vue';
import '@m3e/web/icon';
import '@m3e/web/list';
import '@m3e/web/avatar';
import { useVectors } from '@/stores/vectors';

const vectorsStore = useVectors();

const welcomeComposable = useWelcome();

const welcomeDialog = useTemplateRef<M3eDialogElement>('welcomeDialog');

function openWelcomeDialog() {
	welcomeDialog.value?.show();
}

onMounted(() => {
	welcomeComposable.openWelcomeFunction.value = openWelcomeDialog;
});
</script>

<template>
	<m3e-dialog ref="welcomeDialog">
		<span slot="header">Welcome to Materialvect</span>

		<p>
			Materialvect is a free, open-source, powerful web-based Material 3 Expressive vector
			editor.
		</p>
		<m3e-list>
			<m3e-list-item>
				<m3e-avatar slot="leading">
					<m3e-icon name="code"></m3e-icon>
				</m3e-avatar>
				Free and open-source
			</m3e-list-item>
			<m3e-list-item>
				<m3e-avatar slot="leading">
					<m3e-icon name="offline_pin"></m3e-icon>
				</m3e-avatar>
				Local first
			</m3e-list-item>
			<m3e-list-item>
				<m3e-avatar slot="leading">
					<m3e-icon name="install_desktop"></m3e-icon>
				</m3e-avatar>
				Progressive Web App
			</m3e-list-item>
			<m3e-list-item>
				<m3e-avatar slot="leading">
					<m3e-icon name="colors"></m3e-icon>
				</m3e-avatar>
				Dynamic Material 3 Expressive token colors
			</m3e-list-item>
			<m3e-list-item>
				<m3e-avatar slot="leading">
					<m3e-icon name="backup"></m3e-icon>
				</m3e-avatar>
				Google Drive backups
			</m3e-list-item>
			<m3e-list-item>
				<m3e-avatar slot="leading">
					<m3e-icon name="web"></m3e-icon>
				</m3e-avatar>
				Project Fugu APIs
			</m3e-list-item>
		</m3e-list>
		<p>Materialvect works best on Chromium based browsers.</p>
		<p>
			By using Materialvect, you agree to these <a href="/terms.txt">Terms of Service</a> and
			have read our <a href="/privacy.txt">Privacy Policy</a>.
		</p>
		<p>
			Made with ❤️ by (ing) Studios and Ethan Lee. Materialvect is not vibe-coded and 100%
			made by humans.
		</p>

		<div slot="actions" end>
			<m3e-button
				variant="outlined"
				href="https://github.com/ingStudiosOfficial/materialvect"
				target="_blank"
			>
				<m3e-icon slot="trailing-icon" name="open_in_new"></m3e-icon>
				GitHub
			</m3e-button>
			<m3e-button variant="filled" @click="vectorsStore.refreshVectors()"
				><m3e-dialog-action>Let's go</m3e-dialog-action></m3e-button
			>
		</div>
	</m3e-dialog>
</template>

<style scoped></style>
