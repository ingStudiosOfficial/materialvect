import router from '@/router';
import type { LocationQueryRaw } from 'vue-router';

export function createNewVector(name?: string, width?: number, height?: number) {
	const vectorQueryParams: LocationQueryRaw = {};

	if (name) vectorQueryParams.name = encodeURIComponent(name);
	if (width) vectorQueryParams.width = encodeURIComponent(width);
	if (height) vectorQueryParams.height = encodeURIComponent(height);

	router.push({ name: 'new', query: vectorQueryParams });
}
