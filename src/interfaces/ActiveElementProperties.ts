import type { MvctShape } from './Shape';

export interface ActiveElementProperties {
	type: MvctShape;
	x: number;
	y: number;
	width: number;
	height: number;
	radius: number;
	rotation: number;
}
