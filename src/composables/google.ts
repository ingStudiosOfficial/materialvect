import { clearUserData, getUserData, saveUserData } from '@/db';
import type { UserData } from '@/interfaces/UserData';
import { onMounted, ref } from 'vue';
import { M3eSnackbar } from '@m3e/web/snackbar';
import type { Mvct } from '@/interfaces/Mvct';
import { mvctToObject, objectToMvct } from '@/utils/mvct';
import { useEditor } from '@/stores/editor';

const user = ref<UserData | null>(null);
const accessToken = ref<string | null>(null);
const tokenClient = ref<google.accounts.oauth2.TokenClient | null>(null);
const tokenResolver = ref<((value: unknown) => void) | null>(null);
const openBackupDialogFunction = ref<(() => void) | null>(null);

export function useGoogle() {
	function initClient() {
		if (typeof google === 'undefined') return;

		tokenClient.value = google.accounts.oauth2.initTokenClient({
			client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
			scope: 'openid profile email https://www.googleapis.com/auth/drive.appdata',
			callback: async (tokenResponse) => {
				if (tokenResponse.error) {
					console.error('Error while fetching response:', tokenResponse.error);
					M3eSnackbar.open(tokenResponse.error, {
						duration: 4000,
					});
					return;
				}

				accessToken.value = tokenResponse.access_token;

				if (tokenResolver.value) {
					tokenResolver.value(null);
					tokenResolver.value = null;
				}

				if (!user.value) {
					console.log('No user found, fetching user data.');
					const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
						headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
					});
					const payload = await response.json();
					console.log('Payload:', payload);

					user.value = {
						email: payload.email,
						name: payload.name,
						pfp: payload.picture,
					};
					saveUserData({
						email: payload.email,
						name: payload.name,
						pfp: payload.picture,
					});
				}

				const refreshIn = (Number(tokenResponse.expires_in) - 300) * 1000;
				setTimeout(refreshToken, refreshIn);
			},
		});
	}

	async function refreshToken() {
		return new Promise((resolve) => {
			tokenResolver.value = resolve;

			if (tokenClient.value && user.value?.email)
				tokenClient.value.requestAccessToken({
					hint: user.value.email,
					prompt: 'none',
				});
		});
	}

	function triggerGoogleLogin() {
		if (!tokenClient.value) initClient();
		tokenClient.value?.requestAccessToken();
	}

	async function backVectorUp() {
		const { vector } = useEditor();
		if (!vector) return;

		if (!accessToken.value) {
			await refreshToken();
		}

		console.log('Vector:', vector.metadata);

		vector.metadata.synced = true;

		const file = await objectToMvct(vector);

		const metadata: { name: string; appProperties: { type: string }; parents?: string[] } = {
			name: `${vector.metadata.id}.mvct`,
			appProperties: {
				type: 'vector',
			},
		};
		if (!vector.metadata.googleDriveId) metadata.parents = ['appDataFolder'];

		const form = new FormData();
		form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
		form.append('file', file);

		let urlToFetch = '';
		let methodType: 'POST' | 'PATCH' = 'POST';

		if (vector.metadata.googleDriveId) {
			urlToFetch = `https://www.googleapis.com/upload/drive/v3/files/${vector.metadata.googleDriveId}?uploadType=multipart`;
			methodType = 'PATCH';
		} else {
			urlToFetch = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
			methodType = 'POST';
		}

		const response = await fetch(urlToFetch, {
			method: methodType,
			headers: {
				Authorization: `Bearer ${accessToken.value}`,
			},
			body: form,
		});

		if (!response.ok) {
			M3eSnackbar.open('An error occurred while backing vector up', {
				duration: 4000,
			});
			return;
		}

		const responseJson = await response.json();

		console.log('File ID:', responseJson.id);
		vector.metadata.googleDriveId = responseJson.id;
		vector.metadata.modified = Date.now();

		M3eSnackbar.open('Successfully backed vector up', {
			duration: 4000,
		});
	}

	async function fetchBackedUpVectors(): Promise<Mvct[]> {
		if (!accessToken.value) {
			await refreshToken();
		}

		const query = "appProperties has { key='type' and value='vector' }";

		const params = new URLSearchParams({
			q: query,
			spaces: 'appDataFolder',
			fields: 'files(id, name, appProperties)',
		});

		const url = new URL('https://www.googleapis.com/drive/v3/files');
		url.search = params.toString();

		const listResponse = await fetch(url, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken.value}`,
				Accept: 'application/json',
			},
		});

		if (!listResponse.ok) {
			M3eSnackbar.open('An error occurred while fetching backed up vectors', {
				duration: 4000,
			});
		}

		const data = await listResponse.json();
		const files = data.files;

		console.log('Vectors:', files);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const downloadPromises: (null | Mvct)[] = files.map(async (fileMeta: any) => {
			const mediaResponse = await fetch(
				`https://www.googleapis.com/drive/v3/files/${fileMeta.id}?alt=media`,
				{
					headers: {
						Authorization: `Bearer ${accessToken.value}`,
					},
				},
			);

			if (!mediaResponse.ok) {
				return null;
			}

			const blob = await mediaResponse.blob();
			const file = new File([blob], fileMeta.name, {
				type: blob.type,
			});

			try {
				const vector = await mvctToObject(file);
				return vector;
			} catch (error) {
				console.error('Invalid vector:', error);
			}
		});

		const allVectors = await Promise.all(downloadPromises);

		return allVectors.filter((v) => v !== null);
	}

	async function logUserOut() {
		user.value = null;
		accessToken.value = null;
		tokenClient.value = null;
		await clearUserData();
		M3eSnackbar.open('Successfully logged out', {
			duration: 4000,
		});
	}

	onMounted(async () => {
		const googleData = await getUserData();
		if (googleData) {
			console.log('Found user data from IDB:', googleData);
			user.value = googleData;
			initClient();
		}
	});

	return {
		user,
		accessToken,
		tokenClient,
		openBackupDialogFunction,
		refreshToken,
		triggerGoogleLogin,
		backVectorUp,
		fetchBackedUpVectors,
		logUserOut,
	};
}
