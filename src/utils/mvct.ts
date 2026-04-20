import type { Mvct } from '@/interfaces/Mvct';
import type { MvctTheme } from '@/interfaces/Theme';
import type { VectorProperties } from '@/interfaces/VectorProperties';
import JSZip from 'jszip';

export async function mvctToObject(mvctFile: File): Promise<Mvct> {
	const zip = await JSZip.loadAsync(mvctFile);

	if (!zip) throw new Error('File corrupted (failed to load zip)');

	console.log('Zip:', zip);

	const svg = zip.file('main.svg');
	const css = zip.file('style.css');
	const js = zip.file('main.js');
	const metadata = zip.file('metadata.json');
	const theme = zip.file('theme.json');
	const assets = zip.folder('assets');

	if (!svg || !css || !js || !metadata || !theme || !assets) {
		console.error('Contents:', svg, css, js, metadata, theme, assets);
		throw new Error('File corrupted (contents missing)');
	}

	const svgContent = await svg.async('string');
	const cssContent = await css.async('string');
	const jsContent = await js.async('string');
	const vectorProperties: VectorProperties = JSON.parse(await metadata.async('string'));
	const themeContent: MvctTheme = JSON.parse(await theme.async('string'));

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

	return {
		metadata: vectorProperties,
		svg: svgContent,
		css: cssContent,
		js: jsContent,
		theme: themeContent,
		assets: {
			images: imageFiles,
			fonts: fontFiles,
		},
	};
}

export async function objectToMvct(mvctObject: Mvct): Promise<Blob> {
	const zip = new JSZip();

	zip.file('main.svg', mvctObject.svg);
	zip.file('style.css', mvctObject.css);
	zip.file('main.js', mvctObject.js);
	zip.file('metadata.json', JSON.stringify(mvctObject.metadata));
	zip.file('theme.json', JSON.stringify(mvctObject.theme));

	const assets = zip.folder('assets');
	const images = assets?.folder('images');
	const fonts = assets?.folder('fonts');

	for (const image of mvctObject.assets.images) {
		console.log('Saving image:', image.name);
		images?.file(image.name, image);
	}

	for (const font of mvctObject.assets.fonts) {
		fonts?.file(font.name, font);
	}

	return await zip.generateAsync({ type: 'blob', mimeType: 'vnd.mvct+zip' });
}
