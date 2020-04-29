const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GeneratePackageJsonPlugin = require('generate-package-json-webpack-plugin');
const NodeExternals = require('webpack-node-externals');
const Path = require('path');
const WebpackMessages = require('webpack-messages');

/* path to source code */
const shortSourcePath = './src';

/* config.json */
const configJson =  require(`${shortSourcePath}/config.json`);
const configJsonCertFolder = `.${((configJson.server && configJson.server.secure && configJson.server.secure.certFolder) || '/cert')}`;

/* package.json */
const packageJsonLocation = './package.json';
const packageJson = require(packageJsonLocation);

const versionPackage = (packageJson.version || '');
const outputNamePackage = (packageJson.outputName || 'main.js');

/* paths */
const sourcePath = Path.resolve(__dirname, shortSourcePath);
const destinyPath = Path.resolve(__dirname, `./build${(versionPackage ? '/' + versionPackage : '')}`);

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
		new CopyWebpackPlugin (
			[
				{
					from: Path.resolve(sourcePath, './config.json'), to: Path.resolve(destinyPath, './config.json'), force: true
				},
				{
					from: Path.resolve(sourcePath, './views'), to: Path.resolve(destinyPath, './views'), force: true
				},
				{
					from: Path.resolve(sourcePath, configJsonCertFolder), to: Path.resolve(destinyPath, configJsonCertFolder), force: true
				}
			]
		),
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
		new WebpackMessages (
			{
				name: (packageJson.name || ''),
				logger: str => {
					console.log(`>> ${str}`);
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
