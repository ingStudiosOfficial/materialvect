export async function getAllLocalFonts() {
	if (!('queryLocalFonts' in window)) throw new Error('Local Font Access API not available');

	const availableFonts = await window.queryLocalFonts();

	return availableFonts;
}
