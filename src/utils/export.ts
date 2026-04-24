import type { Mvct } from '@/interfaces/Mvct';
import { objectToMvct } from './mvct';
import { Image, List, Svg } from '@svgdotjs/svg.js';
import { parse } from 'opentype.js';
import { M3eSnackbar } from '@m3e/web/snackbar';
import { cssVarToKey } from './theme';
import { hexFromArgb } from '@material/material-color-utilities';

export async function exportAsMvct(vector: Mvct) {
	const mvct = await objectToMvct(vector);

	if ('showSaveFilePicker' in window) {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: `${vector.metadata.name}.mvct`,
			});
			const writable = await handle.createWritable();
			await writable.write(mvct);
			await writable.close();
		} catch (error) {
			console.error('Error while downloading:', error);

			if ((error as Error).name === 'AbortError') return;

			M3eSnackbar.open((error as Error).message, {
				duration: 4000,
			});
		}
	}
}

export async function blobToBase64(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = () => {
			if (!reader.result || typeof reader.result !== 'string') {
				reject(new Error('Result is not typeof string'));
				return;
			}

			const base64 = reader.result;
			if (!base64) {
				reject(new Error('Base64 string is undefined'));
				return;
			}

			resolve(base64);
		};
	});
}

export async function exportAsSvg(vector: Mvct) {
	try {
		const temporarySvg = new Svg().svg(vector.svg);

		console.log('Temportary SVG:', temporarySvg);

		const allImages = temporarySvg.find('image') as List<Image>;
		const allElements = temporarySvg.find('*');
		const fonts = vector.assets.fonts;

		const rectBg = temporarySvg.findOne('[mvct-bg="true"]');
		if (rectBg)
			rectBg.attr({
				width: vector.metadata.width,
				height: vector.metadata.height,
			});

		for (const image of allImages) {
			const href = (image.attr('xlink:href') || image.attr('href')).replaceAll('/', '');

			const imageBlob = vector.assets.images.find((i) => i.name.includes(href));
			if (!imageBlob) continue;

			const base64 = await blobToBase64(imageBlob);

			image.attr('href', base64);
			image.attr('xlink:href', base64);
		}

		for (const element of allElements) {
			const elementFill = element.fill();
			if (!elementFill) continue;

			try {
				const themeKey = cssVarToKey(elementFill);
				const themeColor = vector.theme[themeKey];

				element.fill(hexFromArgb(themeColor));
			} catch (error) {
				console.error('Error while parsing color:', error, 'Element:', element);
			}
		}

		let css = '';

		for (const fontFile of fonts) {
			const buffer = await fontFile.arrayBuffer();
			const font = parse(buffer);
			const base64 = await blobToBase64(fontFile);

			const fontIdentifier = `/* mvct-font-id: ${font.names.postScriptName.en} */`;

			const fontFace = `
\n${fontIdentifier}
@font-face {
    font-family: '${font.names.fontFamily.en}';
    src: url(${base64});
    font-weight: ${font.tables.os2?.usWeightClass};
    font-style: ${font.names.fontSubfamily.en};
    font-display: swap;
}`;

			css += fontFace;
		}

		temporarySvg.element('style').words(css);
		temporarySvg
			.element('script')
			.attr('type', 'text/javascript')
			.words(`/* <![CDATA[ */\n${vector.js}\n/* ]]> */`);

		const svg = temporarySvg.svg();

		const svgFile = new File([svg], `${vector.metadata.name}.svg`, {
			type: 'image/svg+xml',
		});

		if ('showSaveFilePicker' in window) {
			try {
				const handle = await window.showSaveFilePicker({
					suggestedName: `${vector.metadata.name}.svg`,
				});
				const writable = await handle.createWritable();
				await writable.write(svgFile);
				await writable.close();
			} catch (error) {
				console.error('Error while downloading:', error);

				if ((error as Error).name === 'AbortError') return;

				M3eSnackbar.open((error as Error).message, {
					duration: 4000,
				});
			}
		}
	} catch (error) {
		M3eSnackbar.open((error as Error).message, {
			duration: 4000,
		});
	}
}
