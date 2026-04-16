import { defineStore } from 'pinia';
import { reactive, ref, watch } from 'vue';
import type { MvctElement } from '@/interfaces/MvctElement';
import type { ActiveElementProperties } from '@/interfaces/ActiveElementProperties';
import { List, SVG, Text, type Svg, type Element as SvgElement } from '@svgdotjs/svg.js';
import type { Mvct } from '@/interfaces/Mvct';
import type { MvctElementType } from '@/interfaces/ElementType';

export const useEditor = defineStore('editor', () => {
	const activeElement = ref<MvctElement | null>(null);
	const activeElementProperties = reactive<ActiveElementProperties>({
		type: 'rect',
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		radius: 0,
		rotation: 0,
	});
	const saveFunction = ref<() => void>(() => {});
	const vector = ref<Mvct | null>(null);
	const svgCanvas = ref<Svg | null>(null);
	const draggedElement = ref<SvgElement | null>(null);
	const allElements = reactive<MvctElement[]>([]);
	const textInputString = ref<string | null>(null);
	const openThemeFunction = ref<(() => void) | null>(null);

	let isDragging = false;
	let startPoint = { x: 0, y: 0 };
	let initialElementPos = { x: 0, y: 0 };

	let saveTimeout: ReturnType<typeof setTimeout> | null = null;

	function setActiveElement(element: MvctElement) {
		console.log('Setting active element:', element);
		if (element.node.tagName === 'tspan') {
			console.log('Active element is tspan.');

			const parent = element.parent();
			if (!parent || parent.node.tagName !== 'text') {
				console.error('No text parent for tspan found.');
				return;
			}

			activeElement.value = parent as MvctElement;
		} else activeElement.value = element;

		updateCurrentProperties();
	}

	function clearActiveElement() {
		activeElement.value = null;
	}

	function updateCurrentProperties() {
		if (!activeElement.value) return;

		activeElementProperties.type = activeElement.value.node.tagName as MvctElementType;
		activeElementProperties.x = Number(activeElement.value.x());
		activeElementProperties.y = Number(activeElement.value.y());

		if (activeElementProperties.type === 'rect' || activeElementProperties.type === 'ellipse') {
			activeElementProperties.width = Number(activeElement.value.width());
			activeElementProperties.height = Number(activeElement.value.height());
		} else if (activeElementProperties.type === 'circle') {
			activeElementProperties.radius = Number(activeElement.value.attr('r'));
		}

		activeElementProperties.rotation = Number(activeElement.value.transform('rotate'));
	}

	watch(
		activeElementProperties,
		(newProperties) => {
			if (!activeElement.value) return;

			activeElement.value.x(Number(newProperties.x));
			activeElement.value.y(Number(newProperties.y));

			if (newProperties.type === 'rect' || newProperties.type === 'ellipse') {
				activeElement.value.width(Number(newProperties.width));
				activeElement.value.height(Number(newProperties.height));
			} else if (newProperties.type === 'circle') {
				activeElement.value.attr('r', Number(newProperties.radius));
			}

			activeElement.value.transform({ rotate: Number(newProperties.rotation) });

			if (saveTimeout) clearTimeout(saveTimeout);

			saveTimeout = setTimeout(saveFunction.value, 500);
		},
		{ deep: true },
	);

	watch(textInputString, (newText) => {
		if (!activeElement.value) return;

		console.log('Watched text:', newText);

		if (activeElementProperties.type === 'text') {
			(activeElement.value as unknown as Text).text(newText || '');
		}
	});

	function initialize(loadedVector: Mvct, save: () => void) {
		vector.value = loadedVector;

		const svgVector = SVG().addTo('.svg-wrapper').size('100%', '100%');
		svgVector.viewbox(0, 0, vector.value.metadata.width, vector.value.metadata.height);

		svgVector.on('pointerdown', (event) => {
			if (event.target === svgVector.node) {
				allElements.forEach((element) => {
					element.removeClass('mvct-focus');
				});
				clearActiveElement();
			}
		});

		svgCanvas.value = svgVector;

		svgVector.svg(vector.value.svg);

		const foundElements = svgVector.find('*');

		registerElements(foundElements);

		saveFunction.value = save;
	}

	function registerElement(element: SvgElement) {
		const elementId = element.attr('mvct-id');
		if (!elementId) {
			element.attr('mvct-id', window.crypto.randomUUID());
		}

		const mvctElement = element as MvctElement;
		mvctElement.originalCursorState = element.attr('cursor');

		allElements.push(mvctElement);

		mvctElement.attr({
			cursor: 'pointer',
			tabindex: 0,
		});

		mvctElement.on('pointerdown', (event) => {
			if (svgCanvas.value === null) return;

			const mouseEvent = event as MouseEvent;
			mouseEvent.stopPropagation();

			setActiveElement(mvctElement);

			allElements.forEach((element) => {
				element.removeClass('mvct-focus');
			});
			mvctElement.addClass('mvct-focus');

			draggedElement.value = mvctElement;

			console.log('Pointerdown on:', mouseEvent.target);

			mouseEvent.stopPropagation();
			isDragging = true;

			const pt = svgCanvas.value.point(mouseEvent.clientX, mouseEvent.clientY);
			startPoint = { x: pt.x, y: pt.y };

			initialElementPos = {
				x: mvctElement.x() as number,
				y: mvctElement.y() as number,
			};

			window.addEventListener('pointermove', handleGlobalMove);
			window.addEventListener('pointerup', handleGlobalUp);
		});

		mvctElement.on('keydown', async (event) => {
			const keyEvent = event as KeyboardEvent;
			console.log('Keydown event:', keyEvent.key);

			if (keyEvent.key === 'Delete' || keyEvent.key === 'Backspace') {
				deleteElement(mvctElement);
			}
		});

		if (mvctElement.node.tagName === 'text') {
			mvctElement.on('dblclick', () => {
				const textElement = mvctElement as unknown as Text;

				const bbox = textElement.node.getBoundingClientRect();
				const currentText = textElement.text();

				textElement.hide();
				mvctElement.isTextHidden = true;

				const input = document.createElement('div');
				input.contentEditable = 'true';
				input.style.cssText = `
                    position: absolute;
                    left: ${bbox.left + window.scrollX}px;
                    top: ${bbox.top + window.scrollY}px;
                    min-width: ${bbox.width}px;
                    font-family: ${textElement.attr('font-family') || 'inherit'};
                    font-size: ${textElement.attr('font-size')};
                    color: ${textElement.attr('fill')};
                    background: transparent;
                    outline: none;
                    white-space: pre;
                    z-index: 1000;
                    transform: ${textElement.transform()};
                `;
				input.innerText = currentText;
				document.body.appendChild(input);

				input.focus();

				const range = document.createRange();
				range.selectNodeContents(input);
				const sel = window.getSelection();
				sel?.removeAllRanges();
				sel?.addRange(range);

				const saveChanges = () => {
					const newText = input.innerText.trim();
					textElement.text(newText).show();
					input.remove();
				};

				input.onblur = saveChanges;
				input.onkeydown = (event) => {
					if (event.key === 'Enter' && !event.shiftKey) {
						event.preventDefault();
						input.blur();
					}
				};
			});
		}
	}

	function registerElements(elements: List<SvgElement>) {
		for (const element of elements) {
			registerElement(element);
		}
	}

	function handleGlobalMove(event: MouseEvent) {
		if (!isDragging || !svgCanvas.value || !draggedElement.value) return;

		const pt = svgCanvas.value.point(event.clientX, event.clientY);

		const deltaX = pt.x - startPoint.x;
		const deltaY = pt.y - startPoint.y;

		draggedElement.value.move(initialElementPos.x + deltaX, initialElementPos.y + deltaY);

		updateCurrentProperties();
	}

	function handleGlobalUp() {
		console.log('Handing element up:', draggedElement.value);

		isDragging = false;
		startPoint = { x: 0, y: 0 };
		initialElementPos = { x: 0, y: 0 };

		window.removeEventListener('pointermove', handleGlobalMove);
		window.removeEventListener('pointerup', handleGlobalUp);
	}

	function createShape(shape: MvctElementType) {
		if (!svgCanvas.value) return;

		if (shape === 'rect') {
			const rect = svgCanvas.value.rect(100, 50).attr({
				fill: 'var(--md-sys-color-primary-container)',
				x: svgCanvas.value.bbox().width / 2,
				y: svgCanvas.value.bbox().height / 2,
			});

			registerElement(rect);
		} else if (shape === 'circle') {
			const circle = svgCanvas.value.circle(100).attr({
				fill: 'var(--md-sys-color-primary-container)',
				cx: svgCanvas.value.bbox().width / 2,
				cy: svgCanvas.value.bbox().height / 2,
			});

			registerElement(circle);
		} else if (shape === 'ellipse') {
			const ellipse = svgCanvas.value.ellipse(100, 50).attr({
				fill: 'var(--md-sys-color-primary-container)',
				cx: svgCanvas.value.bbox().width / 2,
				cy: svgCanvas.value.bbox().height / 2,
			});

			registerElement(ellipse);
		}

		saveFunction.value();
	}

	function createText() {
		if (!svgCanvas.value) return;

		const text = svgCanvas.value.text('Text');
		text.attr({
			fill: 'var(--md-sys-color-primary-container)',
			x: svgCanvas.value.bbox().width / 2,
			y: svgCanvas.value.bbox().height / 2,
			'font-family': 'var(--md-ref-typeface-plain)',
			'font-size': '16px',
		});

		registerElement(text);

		saveFunction.value();
	}

	function deleteElement(mvctElement: MvctElement | null | undefined) {
		if (!mvctElement) return;

		allElements.splice(
			allElements.findIndex(
				(element) => element.attr('mvct-id') === mvctElement.attr('mvct-id'),
			),
		);
		mvctElement.remove();
		saveFunction.value();
	}

	function duplicateElement(mvctElement: MvctElement | null | undefined) {
		if (!mvctElement) return;

		console.log('Duplicating element:', mvctElement);

		const newElement = mvctElement.clone(true);
		newElement.attr({
			'mvct-id': window.crypto.randomUUID(),
		});
		console.log('New element:', newElement);

		registerElement(newElement);
	}

	function changeColor(event: InputEvent) {
		if (!activeElement.value) return;

		const color = (event.target as HTMLInputElement).value;

		activeElement.value.fill(color);
	}

	function setCssTheme(css: string) {
		if (!vector.value) return;

		vector.value.css = css;
		saveFunction.value();
	}

	return {
		svgCanvas,
		isDragging,
		vector,
		activeElement,
		activeElementProperties,
		textInputString,
		allElements,
		openThemeFunction,
		setCssTheme,
		initialize,
		createShape,
		createText,
		deleteElement,
		duplicateElement,
		changeColor,
	};
});
