export function fetchMaterialShapes(): Record<string, string>[] {
	const shapes = import.meta.glob('/src/assets/shapes/*.svg', {
		query: '?raw',
		import: 'default',
		eager: true,
	});

	const shapeKeys = Object.keys(shapes) as string[];
	const shapeValues = Object.values(shapes) as string[];

	const shapesToReturn: Record<string, string>[] = [];

	shapeKeys.forEach((key, index) => {
		const value = shapeValues[index];
		if (value) {
			shapesToReturn.push({
				[key]: value.replace(/fill=(["'])(.*?)\1/g, 'fill="var(--md-sys-color-primary)"'),
			});
		}
	});

	return shapesToReturn;
}
