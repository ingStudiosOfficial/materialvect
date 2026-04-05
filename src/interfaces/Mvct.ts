import type { VectorProperties } from './VectorProperties';

export interface Mvct {
	metadata: VectorProperties;
	svg: string;
	css: string;
	js: string;
	assets: {
		images: File[];
		fonts: File[];
	};
}
