import { Element as SvgElement } from '@svgdotjs/svg.js';

export interface MvctElement extends SvgElement {
	originalCursorState: string;
	isTextHidden: boolean;
}
