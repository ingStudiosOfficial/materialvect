<script setup lang="ts">
import '@m3e/web/dialog';
import '@m3e/web/select';
import '@m3e/web/form-field';
import '@m3e/web/option';
import { M3eDialogElement } from '@m3e/web/dialog';
import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import { useEditor } from '@/stores/editor';
import { keyToCssVar } from '@/utils/theme';
import type { MvctTheme } from '@/interfaces/Theme';
import { M3eSelectElement } from '@m3e/web/select';
import '@m3e/web/button';
import { hexFromArgb } from '@material/material-color-utilities';
import { storeToRefs } from 'pinia';

interface ComponentEmits {
	(e: 'input', color: string): void;
}

const emit = defineEmits<ComponentEmits>();

const editorStore = useEditor();

const dialogRef = useTemplateRef<M3eDialogElement>('colorDialog');
const tokenPicker = useTemplateRef<M3eSelectElement>('tokenPicker');
const { vector } = storeToRefs(editorStore);
const selectedColor = ref<string>('var(--mvct-color-primary-container)');
const customColor = ref<string>('#ffffff');

function openColorPicker() {
	dialogRef.value?.show();
}

function tokenToName(token: string): string {
	const result = token.replace(/([a-z\d])([A-Z])/g, '$1 $2').toLowerCase();
	return `${result.charAt(0).toUpperCase()}${result.slice(1)}`;
}

async function onTokenInput() {
	if (!tokenPicker.value?.value || !vector.value?.theme) return;

	await nextTick(); // Ensures that m3e can remove the previous value

	const tokenValue = tokenPicker.value.value;
	console.log('Token value:', tokenValue);

	const tokenCss = keyToCssVar(tokenValue as keyof MvctTheme);

	selectedColor.value = tokenCss;

	console.log('Selected color:', selectedColor.value);

	const colorFromKey = hexFromArgb(vector.value.theme[tokenValue as keyof MvctTheme]);

	console.log('Color from key:', colorFromKey);

	customColor.value = colorFromKey;
}

watch(customColor, (newColor, oldColor) => {
	if (newColor === oldColor) return;

	selectedColor.value = newColor;
});

onMounted(() => {
	editorStore.openColorPickerFunction = openColorPicker;
});
</script>

<template>
	<m3e-dialog ref="colorDialog" dismissible>
		<span slot="header">Color</span>
		<div class="content">
			<p>Default token</p>
			<m3e-form-field v-if="vector?.theme">
				<label slot="label" for="token-picker">Token</label>
				<m3e-select id="token-picker" ref="tokenPicker" @change="onTokenInput()">
					<m3e-option
						v-for="[token] in Object.entries(vector.theme)"
						:key="token"
						:value="token"
						>{{ tokenToName(token) }}</m3e-option
					>
				</m3e-select>
			</m3e-form-field>
			<p>Custom color</p>
			<input type="color" v-model="customColor" />
		</div>

		<div slot="actions" end>
			<m3e-button variant="filled" @click="emit('input', selectedColor)">
				<m3e-dialog-action>Apply</m3e-dialog-action>
			</m3e-button>
		</div>
	</m3e-dialog>
</template>

<style scoped>
.content {
	padding: 10px 0;
}
</style>
