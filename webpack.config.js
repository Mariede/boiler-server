// const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CleanPlugin = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const packageJson = require('./package.json');

let verPackage = (packageJson.version || ''),
	deployFolder = './build' + (verPackage ? '/' + verPackage : '');

const sourcePath = path.resolve(__dirname, './API');
const destinyPath = path.resolve(__dirname, deployFolder);

module.exports = {
	target: 'node',
	mode: 'development', // production para prod
	node: {
		__dirname: false,
		__filename: false
	},
	entry: {
		main: (packageJson.main || '')
	},
	output: {
		filename: '[name].js',
		path: destinyPath
	},
	externals: [
		nodeExternals()
	],
	plugins: [
		new CleanPlugin(),
		new CopyPlugin([
			{
				from: path.resolve(sourcePath, './config.json'), to: path.resolve(destinyPath, './config.json'), force: true
			},
			{
				from: path.resolve(sourcePath, './_home'), to: path.resolve(destinyPath, './_home'), force: true
			}
		]),
	],
	resolve: {
		alias: {
			'@serverRoot': sourcePath
		}
	}
};
