// Learn more about Vitest configuration options at https://vitest.dev/config/

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		reporters: ['default'],
		coverage: {
			provider: 'v8',
			enabled: true,
			reportsDirectory: './coverage/mikane',
			reporter: 'cobertura',
		},
	},
});
