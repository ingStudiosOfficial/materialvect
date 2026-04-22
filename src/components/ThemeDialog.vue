<script setup lang="ts">
import { useEditor } from '@/stores/editor';
import '@m3e/web/dialog';
import { M3eDialogElement } from '@m3e/web/dialog';
import { onMounted, ref, useTemplateRef } from 'vue';
import '@m3e/web/button';
import { M3eSnackbar } from '@m3e/web/snackbar';
import { generateCss, generateTheme } from '@/utils/theme';

const editorStore = useEditor();

const dialogRef = useTemplateRef<M3eDialogElement>('themeDialog');
const seedColor = ref<string>('#ffffff');

function openThemeDialog() {
	dialogRef.value?.show();
}

function updateSeedColor(event: InputEvent) {
	const color = (event.target as HTMLInputElement).value;

	if (color === seedColor.value) return;

	seedColor.value = color;
}

function generateThemeColor() {
	const lightTheme = generateTheme(seedColor.value);

	editorStore.setMvctTheme(lightTheme);

	const generatedCss = generateCss(lightTheme);

	console.log('Generated CSS:', generatedCss);

	editorStore.setCssTheme(generatedCss);

	editorStore.saveFunction();

	M3eSnackbar.open('Successfully generated theme', {
		duration: 4000,
	});
}

onMounted(() => {
	editorStore.openThemeFunction = openThemeDialog;
});
</script>

<template>
	<m3e-dialog ref="themeDialog" dismissible>
		<span slot="header">Edit Theme</span>
		<div class="dialog-content">
			<p class="theme-subheader">Seed Color</p>
			<input type="color" :value="seedColor" @input="updateSeedColor" />
		</div>
		<div slot="actions" end>
			<m3e-button variant="filled" @click="generateThemeColor()"
				><m3e-dialog-action>Generate</m3e-dialog-action></m3e-button
			>
		</div>
	</m3e-dialog>
</template>

<style scoped>
.theme-subheader {
	font-size: 1rem;
	margin: 0;
}

.dialog-content {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;
	gap: 20px;
	padding: 10px 0;
}
</style>
