// ------------------------------------------------------------------------------
/* Required modules */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const NodeExternals = require('webpack-node-externals');
const { resolve } = require('path');
const WebpackMessages = require('webpack-messages');
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
/* Path to source code */
const shortSourcePath = './src';

/* Read config.json */
const configJsonFile =  require(`${shortSourcePath}/config.json`);
const certFolder = `.${((configJsonFile.server && configJsonFile.server.secure && configJsonFile.server.secure.certFolder) || '/cert')}`;

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
	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'eslint-loader',
				options: {
					cache: false,
					configFile: './.eslintrc.json'
				}
			}
		]
	},
	plugins: [
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
					},
					{
						from: resolve(sourcePath, certFolder), to: resolve(destinyPath, certFolder), force: true
					}
				]
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
					node: '>=10.5.0'
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
