import type { MvctTheme } from '@/interfaces/Theme';
import { argbFromHex, hexFromArgb, themeFromSourceColor } from '@material/material-color-utilities';

function toKebabCase(str: string): string {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function toCamelCase(str: string): string {
	return str.replace(/-([a-z])/g, (g) => g[1]!.toUpperCase());
}

export function generateTheme(seedColor: string): MvctTheme {
	const theme = themeFromSourceColor(argbFromHex(seedColor));

	console.log('Generated theme:', JSON.stringify(theme, null, 2));

	const lightTheme = theme.schemes.light.toJSON();

	return lightTheme;
}

export function generateCss(lightTheme: MvctTheme): string {
	let generatedCss = ':root {\n';

	for (const [token, value] of Object.entries(lightTheme)) {
		const lineToInsert = `    --mvct-color-${toKebabCase(token)}: ${hexFromArgb(value)};\n`;
		generatedCss += lineToInsert;
	}

	generatedCss += '}';

	return generatedCss;
}

export function keyToCssVar(key: keyof MvctTheme): string {
	const kebabKey = toKebabCase(key);
	return `var(--mvct-color-${kebabKey})`;
}

export function cssVarToKey(variable: string): keyof MvctTheme {
	const match = variable.match(/--mvct-color-([\w-]+)/);

	if (!match || !match[1]) {
		throw new Error(`Invalid CSS variable format: ${variable}`);
	}

	const kebabKey = match[1];

	return toCamelCase(kebabKey) as keyof MvctTheme;
}
