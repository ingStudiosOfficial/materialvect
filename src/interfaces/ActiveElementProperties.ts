export type ActiveElementType = 'rect' | 'circle' | 'ellipse';

export interface ActiveElementProperties {
	type: ActiveElementType;
	x: number;
	y: number;
	width: number;
	height: number;
	radius: number;
	rotation: number;
}
