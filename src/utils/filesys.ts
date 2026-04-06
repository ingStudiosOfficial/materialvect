import { getDirHandle, saveDirHandle } from '@/db';
import { mvctToObject, objectToMvct } from './mvct';
import type { Mvct } from '@/interfaces/Mvct';

export async function selectProjectFolder(): Promise<Mvct[]> {
	if (!('showDirectoryPicker' in window)) throw new Error('Directory picker API not available');

	const dirHandle = await window.showDirectoryPicker({
		mode: 'readwrite',
	});

	await saveDirHandle(dirHandle);

	const foundProjects: Mvct[] = [];

	for await (const entry of dirHandle.values()) {
		if (entry.kind === 'file' && entry.name.endsWith('.mvct')) {
			const file = await entry.getFile();
			const project = await mvctToObject(file);
			foundProjects.push(project);
		}
	}

	return foundProjects;
}

export async function verifyFolderAccess(): Promise<boolean> {
	const dirHandle = await getDirHandle();
	if (!dirHandle) return false;

	const options: DirectoryPickerOptions = { mode: 'readwrite' };

	if ((await dirHandle.queryPermission(options)) === 'granted') {
		return true;
	}

	if ((await dirHandle.requestPermission(options)) === 'granted') {
		return true;
	}

	return false;
}

export async function fetchProjectsFromDisk(): Promise<Mvct[]> {
	const dirHandle = await getDirHandle();

	if (!dirHandle || !(await verifyFolderAccess())) {
		return await selectProjectFolder();
	}

	const foundProjects = [];

	for await (const entry of dirHandle.values()) {
		if (entry.kind === 'file' && entry.name.endsWith('.mvct')) {
			const file = await entry.getFile();
			const project = await mvctToObject(file);
			foundProjects.push(project);
		}
	}

	return foundProjects;
}

export async function fetchProjectFromDisk(vectorId: string): Promise<Mvct> {
	const dirHandle = await getDirHandle();
	if (!dirHandle) throw new Error('Directory handle missing');

	const fileHandle = await dirHandle.getFileHandle(`${vectorId}.mvct`);
	const file = await fileHandle.getFile();

	const vector = await mvctToObject(file);
	return vector;
}

export async function saveProjectToDisk(vector: Mvct) {
	const dirHandle = await getDirHandle();
	if (!dirHandle) throw new Error('Directory handle missing');

	const fileHandle = await dirHandle.getFileHandle(`${vector.metadata.id}.mvct`, {
		create: true,
	});

	const mvctBlob = await objectToMvct(vector);

	const writable = await fileHandle.createWritable();
	await writable.write(mvctBlob);
	await writable.close();
}

export async function verifyAccessAndFetch(id: string): Promise<Mvct> {
	const canAccess = await verifyFolderAccess();

	if (canAccess) {
		return await fetchProjectFromDisk(id);
	}

	const projects = await selectProjectFolder();

	const currentProject = projects.filter((p) => p.metadata.id === id)[0];

	if (!currentProject) {
		throw new Error('Failed to fetch project from disk');
	}

	return currentProject;
}

export async function deleteProjectFromDisk(id: string) {
	const dirHandle = await getDirHandle();
	if (!dirHandle) throw new Error('Directory handle missing');

	await dirHandle.removeEntry(`${id}.mvct`);
}
