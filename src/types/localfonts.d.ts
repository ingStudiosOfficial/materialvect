// types/local-fonts.d.ts

/**
 * Metadata for a locally installed font face.
 */
interface FontData {
	readonly family: string;
	readonly fullName: string;
	readonly postscriptName: string;
	readonly style: string;

	blob(): Promise<Blob>;
}

interface QueryOptions {
	postscriptNames?: string[];
}

interface Window {
	queryLocalFonts(options?: QueryOptions): Promise<FontData[]>;
}
