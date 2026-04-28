import type { UserData } from '@/interfaces/UserData';
import type { VectorProperties } from '@/interfaces/VectorProperties';
import { openDB, type IDBPDatabase } from 'idb';

async function getDb(): Promise<IDBPDatabase<unknown>> {
	const dbName = import.meta.env.VITE_IDB_NAME;
	const dbVer = Number(import.meta.env.VITE_IDB_VER);

	const db = await openDB(dbName, dbVer, {
		upgrade(db, oldVersion) {
			switch (oldVersion) {
				case 0:
					if (!db.objectStoreNames.contains('vectors')) {
						db.createObjectStore('vectors', { keyPath: 'id' });
					}

				case 1:
					if (!db.objectStoreNames.contains('handle')) {
						db.createObjectStore('google');
					}

				case 2:
					if (!db.objectStoreNames.contains('external')) {
						db.createObjectStore('external', { keyPath: 'id' });
					}

				case 3:
					if (!db.objectStoreNames.contains('google')) {
						db.createObjectStore('google');
					}
			}
		},
	});

	return db;
}

export async function upsertVector(vectorProperties: VectorProperties) {
	const db = await getDb();
	await db.put('vectors', vectorProperties);
}

export async function getVector(id: string): Promise<VectorProperties> {
	const db = await getDb();
	const vectorProperties = await db.get('vectors', id);
	return vectorProperties;
}

export async function getAllVectors(): Promise<VectorProperties[]> {
	const db = await getDb();
	const vectorProperties = await db.getAll('vectors');
	return vectorProperties;
}

export async function saveDirHandle(handle: FileSystemDirectoryHandle) {
	const db = await getDb();
	await db.put('google', handle, 'root');
}

export async function getDirHandle(): Promise<FileSystemDirectoryHandle | null> {
	const db = await getDb();
	return await db.get('google', 'root');
}

export async function deleteVector(id: string) {
	const db = await getDb();
	await db.delete('vectors', id);
}

export async function saveExternalHandle(handle: FileSystemFileHandle, id: string) {
	const db = await getDb();
	await db.put('external', { id, handle });
}

export async function getExternalHandle(
	id: string,
): Promise<{ id: string; handle: FileSystemFileHandle } | null> {
	const db = await getDb();
	const handle = await db.get('external', id);
	return handle || null;
}

export async function saveUserData(data: UserData) {
	const db = await getDb();
	await db.put('google', data, 'acc');
}

export async function getUserData(): Promise<UserData | null> {
	const db = await getDb();
	const data = await db.get('google', 'acc');
	return data || null;
}
