const nodeExternals = require('webpack-node-externals');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const packageJsonLocation = './package.json';
const packageJson = require(packageJsonLocation);

const versionPackage = (packageJson.version || '');
const outputNamePackage = (packageJson.outputName || 'main.js');

const sourcePath = path.resolve(__dirname, './src');
const destinyPath = path.resolve(__dirname, `./build${(versionPackage ? '/' + versionPackage : '')}`);

module.exports = {
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
		filename: outputNamePackage,
		path: destinyPath
	},
	externals: [
		nodeExternals()
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
		new GeneratePackageJsonPlugin (
			{
				'name': (packageJson.name || ''),
				'version': versionPackage,
				'description': (packageJson.description || ''),
				'main': outputNamePackage,
				'license': (packageJson.license || ''),
				'private': true
			},
			packageJsonLocation
		),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin (
			[
				{
					from: path.resolve(sourcePath, './config.json'), to: path.resolve(destinyPath, './config.json'), force: true
				},
				{
					from: path.resolve(sourcePath, './views'), to: path.resolve(destinyPath, './views'), force: true
				}
			]
		),
	],
	resolve: {
		alias: {
			'@serverRoot': sourcePath
		}
	}
};
