import type { Mvct } from '@/interfaces/Mvct';
import printJS from 'print-js';
import { toCleanPng } from './export';
import { M3eSnackbar } from '@m3e/web/snackbar';

export async function printVector(vector: Mvct) {
	try {
		const png = await toCleanPng(vector);

		const file = new File([png], `${vector.metadata.name}.png`, {
			type: 'image/png+xml',
		});
		const url = URL.createObjectURL(file);

		printJS({
			printable: url,
			type: 'image',
			showModal: true,
			font: 'Google Sans Flex',
			documentTitle: vector.metadata.name,
		});
	} catch (error) {
		console.error('An error occurred while printing:', error);
		M3eSnackbar.open((error as Error).message, {
			duration: 4000,
		});
	}
}
