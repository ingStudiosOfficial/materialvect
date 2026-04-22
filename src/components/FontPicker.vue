<script setup lang="ts">
import { useEditor } from '@/stores/editor';
import '@m3e/web/dialog';
import '@m3e/web/button';
import '@m3e/web/form-field';
import '@m3e/web/select';
import '@m3e/web/option';
import { M3eDialogElement } from '@m3e/web/dialog';
import { onMounted, ref, useTemplateRef, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { Font, parse } from 'opentype.js';

const editorStore = useEditor();

const { vector } = storeToRefs(editorStore);
const fontDialog = useTemplateRef<M3eDialogElement>('fontDialog');
const fonts = ref<Font[]>([]);

watchEffect(async () => {
	const promises = vector.value?.assets.fonts.map(async (f) => {
		const buffer = await f.arrayBuffer();
		const font = parse(buffer);
		return font;
	});

	if (!promises) return;

	fonts.value = await Promise.all(promises);
});

function openFontDialog() {
	fontDialog.value?.show();
}

onMounted(() => {
	editorStore.openFontFunction = openFontDialog;
});
</script>

<template>
	<m3e-dialog ref="fontDialog">
		<span slot="header">Choose font</span>
		<div class="content">
			<m3e-form-field v-if="vector">
				<label slot="label" for="font-select">Existing font</label>
				<m3e-select id="font-select">
					<m3e-option v-for="font in fonts" :key="font.names.postScriptName">{{
						font.names.fontFamily.en
					}}</m3e-option>
				</m3e-select>
			</m3e-form-field>
			<m3e-button variant="tonal">Choose local font</m3e-button>
		</div>
	</m3e-dialog>
</template>

<style scoped>
.content {
	display: flex;
	flex-direction: column;
}
</style>
