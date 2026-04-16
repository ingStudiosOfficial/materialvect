<script setup lang="ts">
import { useEditor } from '@/stores/editor';
import '@m3e/web/dialog';
import { M3eDialogElement } from '@m3e/web/dialog';
import { onMounted, ref, useTemplateRef } from 'vue';
import '@m3e/web/button';
import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';
import { M3eSnackbar } from '@m3e/web/snackbar';

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
	const theme = themeFromSourceColor(argbFromHex(seedColor.value));

	console.log('Generated theme:', JSON.stringify(theme, null, 2));

	const lightTheme = theme.schemes.light.toJSON();

	let generatedCss = ':root {\n';

	const toKebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

	for (const [token, value] of Object.entries(lightTheme)) {
		const lineToInsert = `--mvct-${toKebabCase(token)}: ${hexFromArgb(value)};\n`;
		generatedCss += lineToInsert;
	}

	generatedCss += '}';

	console.log('Generated CSS:', generatedCss);

	editorStore.setCssTheme(generatedCss);

	M3eSnackbar.open('Successfully generated theme', {
		duration: 0.4,
	});
}

onMounted(() => {
	editorStore.openThemeFunction = openThemeDialog;
});
</script>

<template>
	<m3e-dialog ref="themeDialog">
		<span slot="header">Edit Theme</span>
		<div class="dialog-content">
			<p class="theme-subheader">Seed Color</p>
			<input type="color" :value="seedColor" @input="updateSeedColor" />
			<m3e-button variant="filled" @click="generateThemeColor()">Generate</m3e-button>
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
}
</style>
