import type { MvctTheme } from '@/interfaces/Theme';
import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';

export function generateTheme(seedColor: string): MvctTheme {
	const theme = themeFromSourceColor(argbFromHex(seedColor));

	console.log('Generated theme:', JSON.stringify(theme, null, 2));

	const lightTheme = theme.schemes.light.toJSON();

	return lightTheme;
}

export function generateCss(lightTheme: MvctTheme): string {
	let generatedCss = ':root {\n';

	const toKebabCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

	for (const [token, value] of Object.entries(lightTheme)) {
		const lineToInsert = `    --mvct-color-${toKebabCase(token)}: ${hexFromArgb(value)};\n`;
		generatedCss += lineToInsert;
	}

	generatedCss += '}';

	return generatedCss;
}
