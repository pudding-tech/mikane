import parser from "@angular-eslint/template-parser";
import { default as eslint } from "@eslint/js";
import angular from "angular-eslint";
import prettier from "eslint-config-prettier";
import github from "eslint-plugin-github";
import optimizeRegex from "eslint-plugin-optimize-regex";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
	globalIgnores(["projects/**/*"]),
	{
		plugins: {
			"optimize-regex": optimizeRegex,
			github,
		},

		languageOptions: {
			globals: {
				...globals.jasmine,
			},
		},

		rules: {
			"optimize-regex/optimize-regex": "warn",
			semi: ["error", "always"],

			"no-console": [
				"error",
				{
					allow: ["warn", "error"],
				},
			],
		},
	},
	{
		ignores: [".angular/**", ".nx/**", "coverage/**", "dist/**"],
		files: ["**/*.ts"],
		extends: [
			eslint.configs.recommended,
			...tseslint.configs.recommended,
			...tseslint.configs.stylistic,
			...angular.configs.tsRecommended,
			prettier,
		],
		processor: angular.processInlineTemplates,
		rules: {
			"@angular-eslint/directive-selector": [
				"error",
				{
					type: "attribute",
					prefix: "app",
					style: "camelCase",
				},
			],

			"@angular-eslint/component-selector": [
				"error",
				{
					type: "element",
					prefix: "app",
					style: "kebab-case",
				},
			],
			"@angular-eslint/prefer-standalone": "warn",
			"@angular-eslint/prefer-on-push-component-change-detection": "warn",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					args: "all",
					argsIgnorePattern: "^_",
					caughtErrors: "all",
					caughtErrorsIgnorePattern: "^_",
					destructuredArrayIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					ignoreRestSiblings: true,
				},
			],
		},
	},
	{
		files: ["**/*.html"],

		extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],

		languageOptions: {
			parser: parser,
		},

		rules: {
			"@angular-eslint/template/click-events-have-key-events": "off",
			"@angular-eslint/template/interactive-supports-focus": "off",
			"@angular-eslint/template/prefer-self-closing-tags": "warn",
			"@angular-eslint/template/prefer-ngsrc": "warn",
			"@angular-eslint/template/prefer-control-flow": "warn",
		},
	},
]);
