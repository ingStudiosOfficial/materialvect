<script setup lang="ts">
import { useEditor } from '@/stores/editor';
import '@m3e/web/dialog';
import '@m3e/web/button';
import '@m3e/web/form-field';
import '@m3e/web/select';
import '@m3e/web/option';
import { M3eDialogElement } from '@m3e/web/dialog';
import '@m3e/web/progress-indicator';
import { onMounted, ref, useTemplateRef, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { Font, parse } from 'opentype.js';
import { getAllLocalFonts } from '@/utils/font';
import { M3eSnackbar } from '@m3e/web/snackbar';
import { M3eSelectElement } from '@m3e/web/select';
import { extension } from 'mime-types';

const editorStore = useEditor();

const { vector } = storeToRefs(editorStore);
const fontDialog = useTemplateRef<M3eDialogElement>('fontDialog');
const fonts = ref<Font[]>([]);
const selectedFont = ref<Font | null>(null);
const localFonts = ref<FontData[]>([]);
const localFontsFetchSuccess = ref<boolean>(false);
const existingFontSelect = useTemplateRef<M3eSelectElement>('existingFontSelect');
const localFontSelect = useTemplateRef<M3eSelectElement>('localFontSelect');
const fontUpload = useTemplateRef<HTMLInputElement>('fontUpload');

const fontTypes: { postscriptName: string; mimeType: string }[] = [];
const createdUrls = new Set<string>();

watchEffect(async (onCleanup) => {
	console.log('Font watch effect called.');

	onCleanup(() => {
		createdUrls.forEach((url) => URL.revokeObjectURL(url));
		createdUrls.clear();
	});

	const promises = vector.value?.assets.fonts.map(async (f) => {
		const buffer = await f.arrayBuffer();
		const font = parse(buffer);
		fontTypes.push({
			postscriptName: font.names.postScriptName.en as string,
			mimeType: f.type,
		});

		const fontIdentifier = `/* mvct-font-id: ${font.names.postScriptName.en} */`;
		const includesFont = editorStore.styleBlock?.node.textContent.includes(fontIdentifier);

		if (!includesFont && editorStore.styleBlock?.node.textContent) {
			const url = URL.createObjectURL(f);
			createdUrls.add(url);

			const fontFace = `
\n${fontIdentifier}
@font-face {
    font-family: '${font.names.fontFamily.en}';
    src: url(${url});
    font-weight: ${font.tables.os2?.usWeightClass};
    font-style: ${font.names.fontSubfamily.en};
    font-display: swap;
}`;
			editorStore.styleBlock.node.textContent += fontFace;
		}

		return font;
	});

	if (!promises) return;

	fonts.value = await Promise.all(promises);
});

function openFontDialog() {
	fontDialog.value?.show();
}

async function fetchLocalFonts() {
	try {
		const fetchedLocalFonts = await getAllLocalFonts();
		localFonts.value = fetchedLocalFonts;
		localFontsFetchSuccess.value = true;
	} catch (error) {
		console.error('Error while fetching local fonts:', error);
		M3eSnackbar.open((error as Error).message, {
			duration: 4000,
		});
	}
}

async function selectExistingFont() {
	const fontPostsript = existingFontSelect.value?.value;
	console.log('Selected existing font:', fontPostsript);
	if (!fontPostsript) return;

	const font = fonts.value.find((f) => f.names.postScriptName.en === fontPostsript);
	console.log('Font:', font);

	if (font) selectedFont.value = font;
	if (localFontSelect.value?.value) localFontSelect.value.clear();
}

async function selectLocalFont() {
	const fontPostsript = localFontSelect.value?.value;
	if (!fontPostsript) return;

	const font = localFonts.value.find((f) => f.postscriptName === fontPostsript);
	if (!font) return;

	try {
		const blob = await font.blob();
		const mimeType = blob.type;
		fontTypes.push({ postscriptName: fontPostsript as string, mimeType: mimeType });

		const buffer = await blob.arrayBuffer();
		const parsedFont = parse(buffer);

		selectedFont.value = parsedFont;
		if (existingFontSelect.value?.value) existingFontSelect.value.clear();
		addNewFont(parsedFont);
	} catch (error) {
		console.error('Error while selecting local font:', error);
		M3eSnackbar.open((error as Error).message, {
			duration: 4000,
		});
	}
}

function addNewFont(parsedFont: Font) {
	console.log('Attempting to add new font:', parsedFont);

	if (
		fonts.value
			.map((f) => f.names.postScriptName.en)
			.includes(parsedFont.names.postScriptName.en)
	) {
		console.log('Font already included.');
		return;
	}

	const mimeType = fontTypes.find((f) => f.postscriptName === parsedFont.names.postScriptName.en);
	if (!mimeType?.mimeType) return;

	const buffer = parsedFont.toArrayBuffer();
	const file = new File(
		[buffer],
		`${parsedFont.names.postScriptName.en}.${extension(mimeType.mimeType)}`,
		{
			type: mimeType.mimeType,
			lastModified: Date.now(),
		},
	);

	vector.value?.assets.fonts.push(file);

	console.log('Added local font:', file.name, vector.value?.assets.fonts);
}

async function onFontUpload() {
	const file = fontUpload.value?.files?.[0];
	if (!file) return;

	try {
		const buffer = await file.arrayBuffer();
		const parsedFont = parse(buffer);

		const fontPostscript = parsedFont.names.postScriptName.en;

		const mimeType = file.type;
		fontTypes.push({ postscriptName: fontPostscript as string, mimeType: mimeType });

		selectedFont.value = parsedFont;

		addNewFont(parsedFont);
	} catch (error) {
		console.error('Error while parsing uploaded font:', error);
		M3eSnackbar.open((error as Error).message, {
			duration: 4000,
		});
	}
}

async function applyFont() {
	console.log('Applying font:', selectedFont.value?.names.postScriptName.en);

	if (
		!editorStore.styleBlock ||
		!selectedFont.value ||
		!selectedFont.value.names.postScriptName.en
	) {
		console.log('One of the values are missing, cannot apply font.');
		return;
	}

	const fontIdentifier = `/* mvct-font-id: ${selectedFont.value.names.postScriptName.en} */`;

	const includesFont = editorStore.styleBlock.node.textContent.includes(fontIdentifier);
	console.log('Includes font:', includesFont);

	if (!includesFont) {
		console.log('CSS does not include font.');

		try {
			const arrayBuffer = selectedFont.value.toArrayBuffer();
			const blob = new Blob([arrayBuffer]);
			const url = URL.createObjectURL(blob);

			const fontFace = `
\n${fontIdentifier}
@font-face {
    font-family: '${selectedFont.value.names.fontFamily.en}';
    src: url(${url});
    font-weight: ${selectedFont.value.tables.os2?.usWeightClass};
    font-style: ${selectedFont.value.names.fontSubfamily.en};
    font-display: swap;
}`;

			editorStore.styleBlock.node.textContent += fontFace;
			console.log('Added font face:', fontFace, editorStore.styleBlock.node.textContent);
		} catch (error) {
			M3eSnackbar.open((error as Error).message, {
				duration: 4000,
			});
			return;
		}
	}

	editorStore.activeElement?.attr('font-family', selectedFont.value.names.fontFamily.en);
	console.log('Set font family:', selectedFont.value.names.fontFamily.en);

	fontDialog.value?.hide();

	editorStore.saveFunction();
}

onMounted(() => {
	editorStore.openFontFunction = openFontDialog;
});
</script>

<template>
	<m3e-dialog ref="fontDialog" dismissible>
		<span slot="header">Choose font</span>
		<div class="content">
			<m3e-form-field v-if="vector" class="dialog-field">
				<label slot="label" for="font-select">Existing font</label>
				<m3e-select
					id="font-select"
					ref="existingFontSelect"
					@change="selectExistingFont()"
				>
					<m3e-option
						v-for="font in fonts"
						:key="font.names.postScriptName.en || Math.random()"
						:value="font.names.postScriptName.en"
						>{{ font.names.fullName.en }}</m3e-option
					>
				</m3e-select>
			</m3e-form-field>

			<m3e-form-field v-if="localFontsFetchSuccess" class="dialog-field">
				<label slot="label" for="font-select">Local font</label>
				<m3e-select id="font-select" ref="localFontSelect" @change="selectLocalFont()">
					<m3e-option
						v-for="font in localFonts"
						:key="font.postscriptName"
						:value="font.postscriptName"
						>{{ font.fullName }}</m3e-option
					>
				</m3e-select>
			</m3e-form-field>
			<m3e-button v-else variant="tonal" @click="fetchLocalFonts()"
				>Fetch local fonts</m3e-button
			>

			<m3e-button variant="tonal" @click="fontUpload?.click()">Upload font</m3e-button>
			<input
				ref="fontUpload"
				type="file"
				accept=".ttf, .otf, .woff, .woff2, font/ttf, font/otf, font/woff, font/woff2"
				style="display: none"
				@input="onFontUpload()"
			/>
		</div>
		<div slot="actions" class="actions" end>
			<p class="selected-font-name">
				{{
					selectedFont?.names?.fullName?.en
						? `Font: ${selectedFont?.names?.fullName?.en}`
						: 'No selected font'
				}}
			</p>
			<m3e-button variant="filled" @click="applyFont()">Apply</m3e-button>
		</div>
	</m3e-dialog>
</template>

<style scoped>
.content {
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 10px 0;
}

.dialog-field {
	width: 100%;
}

.actions {
	gap: 20px;
}

.selected-font-name {
	width: 15ch;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
