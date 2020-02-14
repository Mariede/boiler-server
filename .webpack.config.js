const nodeExternals = require('webpack-node-externals');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const packageJsonLocation = './package.json';
const packageJson = require(packageJsonLocation);

const namePackage = (packageJson.name || '');
const versionPackage = (packageJson.version || '');
const descriptionPackage = (packageJson.description || '');
const mainPackage = (packageJson.main || '');
const licensePackage = (packageJson.license || '');
const outputNamePackage = (packageJson.outputName || 'main.js');
const deployFolder = './build' + (versionPackage ? '/' + versionPackage : '');

const sourcePath = path.resolve(__dirname, './src');
const destinyPath = path.resolve(__dirname, deployFolder);

module.exports = {
	target: 'node',
	mode: 'production', // development para dev | production para prod
	node: {
		__dirname: false,
		__filename: false
	},
	entry: {
		main: mainPackage
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
				loader: 'eslint-loader'
				// options: {
				// }
			}
		]
	},
	plugins: [
		new GeneratePackageJsonPlugin(
			{
				'name': namePackage,
				'version': versionPackage,
				'description': descriptionPackage,
				'main': outputNamePackage,
				'license': licensePackage,
				'private': true
			}
			, packageJsonLocation
		),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin([
			{
				from: path.resolve(sourcePath, './config.json'), to: path.resolve(destinyPath, './config.json'), force: true
			},
			{
				from: path.resolve(sourcePath, './views'), to: path.resolve(destinyPath, './views'), force: true
			}
		]),
	],
	resolve: {
		alias: {
			'@serverRoot': sourcePath
		}
	}
};
