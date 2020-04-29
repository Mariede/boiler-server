'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const fs = require('fs');
const log4js = require('log4js');
const moduleAlias = require('module-alias');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Definindo caminho global do servidor
global.__serverRoot = __dirname;

moduleAlias.addAliases ({
	'@serverRoot': __serverRoot
});
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const app = require('@serverRoot/server/app');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Primeiro passo para a inicializacao do servidor: logs / config / certificado
const startMain = async () => {
	try {
		// Logs do servidor ------------------------------------------------
		log4js.configure ({
			appenders: {
				consoleAppender: {
					type: 'console'
				},
				errorsControllerAppender: {
					type: 'dateFile',
					filename: `${__serverRoot}/logs/errors-controller/logs-errors-controller.log`,
					pattern: '.yyyy-MM-dd',
					daysToKeep: 15,
					compress: false
				},
				startUpAppender: {
					type: 'dateFile',
					filename: `${__serverRoot}/logs/start-up/logs-start-up.log`,
					pattern: '.yyyy-MM-dd',
					daysToKeep: 15,
					compress: false
				},
				configFileAppender: {
					type: 'dateFile',
					filename: `${__serverRoot}/logs/config-file/logs-config-file.log`,
					pattern: '.yyyy-MM-dd',
					daysToKeep: 15,
					compress: false
				},
				routesAppender: {
					type: 'dateFile',
					filename: `${__serverRoot}/logs/routes/logs-routes.log`,
					pattern: '.yyyy-MM-dd',
					daysToKeep: 30,
					compress: false
				},
				mailQueueAppender: {
					type: 'dateFile',
					filename: `${__serverRoot}/logs/mail-queue/logs-mail-queue.log`,
					pattern: '.yyyy-MM-dd',
					daysToKeep: 15,
					compress: false
				}
			},
			categories: {
				default: { appenders: ['consoleAppender', 'errorsControllerAppender'], level: 'warn' },
				consoleOnly: { appenders: ['consoleAppender'], level: 'all' },
				startUp: { appenders: ['consoleAppender', 'startUpAppender'], level: 'all' },
				configFile: { appenders: ['consoleAppender', 'configFileAppender'], level: 'all' },
				routes: { appenders: ['consoleAppender', 'routesAppender'], level: 'all' },
				mailQueue: { appenders: ['consoleAppender', 'mailQueueAppender'], level: 'all' },
				startUpAll: { appenders: ['consoleAppender', 'errorsControllerAppender', 'startUpAppender', 'configFileAppender', 'routesAppender', 'mailQueueAppender'], level: 'all' }

			}
		});
		// -------------------------------------------------------------------------

		// Dados prioritarios do servidor ------------------------------------------
		const getAppConfigData = async path => { // Configuracoes do servidor
			const fsPromises = fs.promises;
			return JSON.parse(await fsPromises.readFile(path, 'utf8'));
		};

		const getAppCert = async () => { // Certificado digital (apenas se ativo)
			const fsPromises = fs.promises;

			const result = {};

			if (__serverConfig.server.secure.isHttps) {
				const certPath = `${__serverRoot + __serverConfig.server.secure.certFolder}/`;
				const certKey = certPath + __serverConfig.server.secure.certKey;
				const certPublic = certPath + __serverConfig.server.secure.certPublic;

				result.key = await fsPromises.readFile(certKey, 'utf8');
				result.public = await fsPromises.readFile(certPublic, 'utf8');
			}

			return result;
		};

		// Caminho para o arquivo de configuracoes
		const configPath = `${__serverRoot}/config.json`;

		// Variaveis globais
		global.__serverConfig = Object.freeze(await getAppConfigData(configPath));
		global.__serverWorker = undefined; // Server Worker inicialmente sem cluster (trabalhador unico)

		const myCert = await getAppCert();
		// -------------------------------------------------------------------------

		app.startApp(myCert, configPath);
	} catch (err) {
		console.error(err); // eslint-disable-line no-console
	}
};
// -------------------------------------------------------------------------

startMain();
