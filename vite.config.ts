import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import { IconResource, VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) => tag.startsWith('m3e-'),
				},
			},
		}),
		vueDevTools(),
		VitePWA({
			registerType: 'autoUpdate',
			strategies: 'generateSW',
			manifest: {
				short_name: 'Materialvect',
				name: 'Materialvect',
				description: 'A powerful web based Material 3 Expressive SVG editor.',
				icons: [
					{
						src: 'materialvect_logo_trans_full.png',
						sizes: '500x500',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: 'materialvect_logo_trans.png',
						sizes: '500x500',
						type: 'image/png',
						purpose: 'maskable',
					},
					{
						src: 'materialvect_logo_trans_full.png',
						sizes: '500x500',
						type: 'image/png',
						purpose: 'monochrome',
					},
				],
				file_handlers: [
					{
						action: '/open-mvct',
						accept: {
							'application/vnd.mvct+zip': ['.mvct'],
						},
						icons: [
							{
								src: 'materialvect_logo_trans_full.png',
								sizes: '500x500',
								type: 'image/png',
								purpose: 'any',
							},
						] as IconResource[],
						launch_type: 'multiple-clients',
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
					} as any,
				],
				start_url: '/',
				display: 'standalone',
				theme_color: '#FEF7FF',
				background_color: '#FEF7FF',
				categories: ['productivity', 'utilities'],
			},
			srcDir: 'src/',
			includeAssets: ['public/*'],
			workbox: {
				globPatterns: ['**/*.{html,css,js,png,svg,ico,json}'],
				globDirectory: 'dist',
				cacheId: 'v1.0.0',
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true,
				navigateFallback: '/index.html',
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365,
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
			devOptions: {
				enabled: true,
				type: 'module',
			},
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
