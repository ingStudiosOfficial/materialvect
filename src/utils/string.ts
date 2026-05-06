export function toStartCase(str: string): string {
	return str
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/^\w/, (c: string) => c.toUpperCase());
}
