declare const google: {
	accounts: {
		id: {
			initialize: (config: object) => void;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			prompt: (callback?: (notification: any) => void) => void;
		};
		oauth2: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			initTokenClient: any;
		};
	};
};
