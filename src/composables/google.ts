import { getUserData } from '@/db';
import type { UserData } from '@/interfaces/UserData';
import { onMounted, ref } from 'vue';

const user = ref<UserData | null>(null);

export function useGoogle() {
	onMounted(async () => {
		const googleData = await getUserData();
		if (googleData) {
			console.log('Found user data from IDB:', googleData);
			user.value = googleData;
		}
	});

	return { user };
}
