import type { VectorFile } from '@/interfaces/VectorFile';
import { openDB, type IDBPDatabase } from 'idb';

async function getDb(): Promise<IDBPDatabase<unknown>> {
	const dbName = import.meta.env.VITE_IDB_NAME;
	const dbVer = Number(import.meta.env.VITE_IDB_VER);

	console.log(dbName, dbVer);

	const db = await openDB(dbName, dbVer, {
		upgrade(db, oldVersion) {
			switch (oldVersion) {
				case 0:
					if (!db.objectStoreNames.contains('vectors')) {
						db.createObjectStore('vectors', { keyPath: 'id' });
					}
			}
		},
	});

	return db;
}

export async function upsertVector(vectorFile: VectorFile) {
	const db = await getDb();
	await db.put('vectors', vectorFile);
}

export async function getVector(id: string): Promise<VectorFile> {
	const db = await getDb();
	const vectorFile = await db.get('vectors', id);
	return vectorFile;
}

export async function getAllVectors(): Promise<VectorFile[]> {
	const db = await getDb();
	const vectorFiles = await db.getAll('vectors');
	return vectorFiles;
}
