module.exports = {
	'env': {
		browser: true,
		es6: true,
		jquery: true,
		node: true
	},
	extends: [
		'eslint:recommended',
		// 'plugin:jquery/deprecated'
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
		Webflow: 'readonly',
		process: 'readonly' // replaced at compile time by webpack
	},
	parser: '@babel/eslint-parser',
	parserOptions: {
		ecmaFeatures: { jsx: true },
		ecmaVersion: 11,
		sourceType: 'module'
	},
	plugins: [/* 'jquery' */],
	rules: { /*'react/prop-types': 'off'*/	}
};
