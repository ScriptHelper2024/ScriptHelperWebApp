/* eslint-disable-next-line no-undef */
module.exports = {
	purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	darkMode: 'class', // or 'media' or 'class'
	theme: {
		extend: {
			height: {
				'600px': '600px',
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
}
