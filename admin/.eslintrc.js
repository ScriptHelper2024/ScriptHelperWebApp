module.exports = {
	settings: {
		react: {
			version: 'detect',
		},
	},
	env: {
		browser: true,
		es2021: true,
		jest: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
	],
	overrides: [
		{
			env: {
				node: true,
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script',
			},
		},
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'react'],
	rules: {
		'no-unreachable': 1,
		'@typescript-eslint/no-empty-function': 1,
		'@typescript-eslint/no-this-alias': 1,
		'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
		'@typescript-eslint/no-var-requires': 0,
		'no-debugger': 1,
		'react/prop-types': 1,
		'no-constant-condition': 1,
		'no-extra-boolean-cast': 0,
		'@typescript-eslint/no-unused-vars': [
			'warn', // or "error"
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
			},
		],
	},
}
