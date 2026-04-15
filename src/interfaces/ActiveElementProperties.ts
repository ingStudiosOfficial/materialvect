import type { MvctElementType } from './ElementType';

export interface ActiveElementProperties {
	type: MvctElementType;
	x: number;
	y: number;
	width: number;
	height: number;
	radius: number;
	rotation: number;
}
