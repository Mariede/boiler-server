// ------------------------------------------------------------------------------
/* Required modules */
const NodeExternals = require('webpack-node-externals');

const ESLintPlugin = require('eslint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const WebpackMessages = require('webpack-messages');

const { resolve } = require('path');
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
/* Path to source code */
const shortSourcePath = './src';

/* Read config.json */
const configJsonFile =  require(`${shortSourcePath}/config.json`);
const certFolder = `.${((configJsonFile.server && configJsonFile.server.secure && configJsonFile.server.secure.certFolder) || '/cert')}`;
const isHttps = (configJsonFile.server && configJsonFile.server.secure && configJsonFile.server.secure.isHttps) === true;

/* Read package.json */
const packageJsonFile = './package.json';
const packageJson = require(packageJsonFile);

const name = (packageJson.name || '');
const outputName = (packageJson.outputName || 'main.js');

/* Final paths */
const sourcePath = resolve(__dirname, shortSourcePath);
const destinyPath = resolve(__dirname, './build');
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
/* Build configuration */
const generateBuild = {
	target: 'node',
	mode: 'production', // development para dev | production para prod
	node: {
		__dirname: false,
		__filename: false
	},
	entry: {
		main: (packageJson.main || '')
	},
	output: {
		filename: outputName,
		path: destinyPath
	},
	externals: [
		NodeExternals()
	],
	plugins: [
		new ESLintPlugin(
			{
				context: './src',
				eslintPath: 'eslint',
				extensions: ['js', 'jsx'],
				exclude: ['node_modules']
			}
		),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin(
			{
				patterns: [
					{
						from: resolve(sourcePath, '..', './package-lock.json'), to: resolve(destinyPath, './package-lock.json'), force: true
					},
					{
						from: resolve(sourcePath, './config.json'), to: resolve(destinyPath, './config.json'), force: true
					},
					{
						from: resolve(sourcePath, './views'), to: resolve(destinyPath, './views'), force: true
					}
				].concat(
					isHttps ? (
						[
							{
								from: resolve(sourcePath, certFolder), to: resolve(destinyPath, certFolder), force: true
							}
						]
					) : (
						[]
					)
				)
			}
		),
		new GeneratePackageJsonPlugin(
			{
				name: name,
				version: (packageJson.version || ''),
				description: (packageJson.description || ''),
				main: `./${outputName}`,
				type: (packageJson.type || ''),
				license: (packageJson.license || ''),
				private: true,
				engines: {
					node: '>=12.22.0'
				},
				scripts: {
					start: `node ./${outputName}`
				}
			}
		),
		new WebpackMessages(
			{
				name: name,
				logger: res => {
					console.log(`>> ${res}`);
				}
			}
		)
	],
	resolve: {
		alias: {
			'@serverRoot': sourcePath
		}
	}
};
// ------------------------------------------------------------------------------

module.exports = generateBuild;
