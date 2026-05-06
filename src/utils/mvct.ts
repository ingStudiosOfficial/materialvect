import type { Mvct } from '@/interfaces/Mvct';
import type { MvctTheme } from '@/interfaces/Theme';
import type { VectorProperties } from '@/interfaces/VectorProperties';
import JSZip from 'jszip';
import type { ActionEvent } from '@/interfaces/ActionEvent';

export async function mvctToObject(mvctFile: File): Promise<Mvct> {
	const zip = await JSZip.loadAsync(mvctFile);

	if (!zip) throw new Error('File corrupted (failed to load zip)');

	console.log('Zip:', zip);

	const svg = zip.file('main.svg');
	const css = zip.file('style.css');
	const js = zip.file('main.js');
	const metadata = zip.file('metadata.json');
	const theme = zip.file('theme.json');
	const events = zip.file('events.json');
	const assets = zip.folder('assets');

	let eventsContent: ActionEvent[] = [];

	if (!svg || !css || !js || !metadata || !theme || !assets) {
		console.error('Contents:', svg, css, js, metadata, theme, assets);
		throw new Error('File corrupted (contents missing)');
	}

	const svgContent = await svg.async('string');
	const cssContent = await css.async('string');
	const jsContent = await js.async('string');
	const vectorProperties: VectorProperties = JSON.parse(await metadata.async('string'));
	const themeContent: MvctTheme = JSON.parse(await theme.async('string'));
	// Compatability with older versions
	if (events) {
		const eventsString = await events.async('string');
		console.log('Events string:', eventsString);
		eventsContent = JSON.parse(eventsString);
	} else {
		eventsContent = [];
	}

	const images = assets.folder('images');
	const fonts = assets.folder('fonts');

	if (!images || !fonts) throw new Error('File corrupted (assets missing)');

	const imagePromises: Promise<File>[] = [];
	const fontPromises: Promise<File>[] = [];

	images.forEach((name, file) => {
		if (file.dir) return;

		const promise = file.async('blob').then((blob) => {
			return new File([blob], name, {
				type: blob.type || 'image/png',
				lastModified: file.date.getTime(),
			});
		});

		imagePromises.push(promise);
	});

	fonts.forEach((name, file) => {
		if (file.dir) return;

		const promise = file.async('blob').then((blob) => {
			return new File([blob], name, {
				type: blob.type || 'font/ttf',
				lastModified: file.date.getTime(),
			});
		});

		fontPromises.push(promise);
	});

	const imageFiles = await Promise.all(imagePromises);
	const fontFiles = await Promise.all(fontPromises);

	// Compatability with older versions
	if (!vectorProperties.seedColor) {
		vectorProperties.seedColor = '#CBA9FF';
	}

	return {
		metadata: vectorProperties,
		svg: svgContent,
		css: cssContent,
		js: jsContent,
		theme: themeContent,
		events: eventsContent,
		assets: {
			images: imageFiles,
			fonts: fontFiles,
		},
	};
}

export async function objectToMvct(mvctObject: Mvct): Promise<File> {
	const zip = new JSZip();

	zip.file('main.svg', mvctObject.svg);
	zip.file('style.css', mvctObject.css);
	zip.file('main.js', mvctObject.js);
	zip.file('metadata.json', JSON.stringify(mvctObject.metadata));
	zip.file('theme.json', JSON.stringify(mvctObject.theme));
	zip.file('events.json', JSON.stringify(mvctObject.events));

	const assets = zip.folder('assets');
	const images = assets?.folder('images');
	const fonts = assets?.folder('fonts');

	for (const image of mvctObject.assets.images) {
		console.log('Saving image:', image.name);
		images?.file(image.name, image);
	}

	console.log('Fonts:', mvctObject.assets.fonts);

	for (const font of mvctObject.assets.fonts) {
		console.log('Saving font:', font.name);
		fonts?.file(font.name, font);
	}

	return (await zip.generateAsync({
		type: 'blob',
		mimeType: 'application/vnd.mvct+zip',
	})) as File;
}
