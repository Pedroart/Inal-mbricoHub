module.exports = {
	plugins: {
		tailwindcss: {
			config: './packages/renderer/tailwind.config.cjs',
		},
		...(process.env.NODE_ENV === 'production' && {
			tailwindcss: {
				config: './tailwind.config.cjs',
			},
		}),
		autoprefixer: {},
	},
};