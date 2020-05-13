// ------------------------------------------------------------------------------
/* Required modules */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const NodeExternals = require('webpack-node-externals');
const Path = require('path');
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
const version = (packageJson.version || '');
const outputName = (packageJson.outputName || 'main.js');

/* Final paths */
const sourcePath = Path.resolve(__dirname, shortSourcePath);
const destinyPath = Path.resolve(__dirname, `./build${(version ? `/${version}` : '')}`);
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
			[
				{
					from: Path.resolve(sourcePath, './config.json'), to: Path.resolve(destinyPath, './config.json'), force: true
				},
				{
					from: Path.resolve(sourcePath, './views'), to: Path.resolve(destinyPath, './views'), force: true
				},
				{
					from: Path.resolve(sourcePath, certFolder), to: Path.resolve(destinyPath, certFolder), force: true
				}
			]
		),
		new GeneratePackageJsonPlugin(
			{
				name: name,
				version: version,
				description: (packageJson.description || ''),
				main: outputName,
				license: (packageJson.license || ''),
				private: true
			},
			packageJsonFile
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
