import type { MvctTheme } from './Theme';
import type { VectorProperties } from './VectorProperties';

export interface Mvct {
	metadata: VectorProperties;
	svg: string;
	css: string;
	js: string;
	theme: MvctTheme;
	assets: {
		images: File[];
		fonts: File[];
	};
}
