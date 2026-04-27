import router from '@/router';
import type { LocationQueryRaw } from 'vue-router';

export function createNewVector(name?: string, width?: number, height?: number) {
	const vectorQueryParams: LocationQueryRaw = {};

	if (name) vectorQueryParams.name = name;
	if (width) vectorQueryParams.width = width;
	if (height) vectorQueryParams.height = height;

	router.push({ name: 'new', query: vectorQueryParams });
}
