'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const cluster = require('cluster');
const os = require('os');
const log4js = require('log4js');
const moduleAlias = require('module-alias');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Definindo caminhos globais de acesso para elementos do servidor
global.__serverRoot = __dirname;

moduleAlias.addAliases({
	'@serverRoot': __serverRoot
});
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const socketIo = require('@serverRoot/server/socketIo'); // Lib socket.io
const _server = require('@serverRoot/server/_server');
const configManage = require('@serverRoot/server/configManage');
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Procedimentos prioritarios

// Acessando informacoes do arquivo de configuracoes do servidor
const configPath = __serverRoot + '/config.json';

// Server Worker (cluster) inicialmente sem cluster (trabalhador unico)
global.__serverWorker = null;
// -------------------------------------------------------------------------

const startApp = async () => {
	try {
		const showMessages = messages => {
			let checkType = 'info',
				messagesCheckType = '',
				padStart = ''.padStart(43) + '-> ',
				i = 0;

			messages.forEach(
				message => {
					if (message[0] === checkType) {
						messagesCheckType = messagesCheckType + (i !== 0 ? padStart : '') + message[1] + '\r\n';
					} else {
						log.logger(message[0], message[1], 'startUp');
					}

					i++;
				}
			);

			if (messagesCheckType) {
				log.logger(checkType, messagesCheckType, 'startUp');
			}
		};

		const osNumThreads = os.cpus().length;

		let serverClustered = __serverConfig.server.clustered,
			numWorkers = 0;

		// -------------------------------------------------------------------------
		// Verificar se servidor e clusterizado
		if (osNumThreads > 1) {
			if (typeof serverClustered === 'boolean' && serverClustered) {
				numWorkers = osNumThreads;
			} else {
				if (Number.isInteger(serverClustered)) {
					serverClustered = Number(serverClustered);

					if (serverClustered > 1 && serverClustered < osNumThreads) {
						numWorkers = serverClustered;
					} else {
						if (serverClustered === 0 || serverClustered >= osNumThreads) {
							numWorkers = osNumThreads;
						}
					}
				}
			}
		}
		// -------------------------------------------------------------------------

		// -------------------------------------------------------------------------
		// Middleware

		// logs --------------------------------------------------------------------
		log4js.configure({
			appenders: {
				consoleAppender: {
					type: 'console'
				},
				controllerErrorsAppender: {
					type: 'dateFile',
					filename: (__serverRoot + '/logs/controllerErrors/logs-controllerErrors.log'),
					pattern: '.yyyy-MM-dd',
					daysToKeep: 15,
					compress: false
				},
				startUpAppender: {
					type: 'dateFile',
					filename: (__serverRoot + '/logs/startUp/logs-startUp.log'),
					pattern: '.yyyy-MM-dd',
					daysToKeep: 15,
					compress: false
				},
				configFileAppender: {
					type: 'dateFile',
					filename: (__serverRoot + '/logs/configFile/logs-configFile.log'),
					pattern: '.yyyy-MM-dd',
					daysToKeep: 15,
					compress: false
				},
				routesAppender: {
					type: 'dateFile',
					filename: (__serverRoot + '/logs/routes/logs-routes.log'),
					pattern: '.yyyy-MM-dd',
					daysToKeep: 30,
					compress: false
				},
				mailQueueAppender: {
					type: 'dateFile',
					filename: (__serverRoot + '/logs/mailQueue/logs-mailQueue.log'),
					pattern: '.yyyy-MM-dd',
					daysToKeep: 15,
					compress: false
				}
			},
			categories: {
				default: { appenders: ['consoleAppender', 'controllerErrorsAppender'], level: 'warn' },
				consoleOnly: { appenders: ['consoleAppender'], level: 'all' },
				startUp: { appenders: ['consoleAppender', 'startUpAppender'], level: 'all' },
				configFile: { appenders: ['consoleAppender', 'configFileAppender'], level: 'all' },
				routes: { appenders: ['consoleAppender', 'routesAppender'], level: 'all' },
				mailQueue: { appenders: ['consoleAppender', 'mailQueueAppender'], level: 'all' },
				startUpAll: { appenders: ['consoleAppender', 'controllerErrorsAppender', 'startUpAppender', 'configFileAppender', 'routesAppender', 'mailQueueAppender'], level: 'all' }

			}
		});
		// -------------------------------------------------------------------------

		if (!numWorkers || (numWorkers && cluster.isMaster)) {
			socketIo.startIo();
		}

		if (numWorkers) {
			if (cluster.isMaster) {
				log.logger('info', '|| ********************************************************* ||', 'startUpAll');
				log.logger('info', '|| Processo de inicialização do servidor - clusterizado: SIM ||', 'startUpAll');
				log.logger('info', '|| ********************************************************* ||', 'startUpAll');

				log.logger('info', `Cluster mestre definindo ${numWorkers} trabalhadores`, 'startUp');

				for (let i = 0; i < numWorkers; i++) {
					cluster.fork();
				}

				cluster.on (
					'online',
					worker => {
						log.logger('info', `Cluster ${worker.process.pid}, trabalhador ${worker.id} - está ativo`, 'startUp');
					}
				);

				cluster.on (
					'exit',
					(worker, code, signal) => {
						log.logger('info', `Cluster ${worker.process.pid}, trabalhador ${worker.id} - finalizou os serviços${(signal ? ' pelo sinal ' + signal : ' com o código ' + code)}`, 'startUp');
						log.logger('info', 'Iniciando novo trabalhador', 'startUp');

						cluster.fork();
					}
				);
			} else {
				if (cluster.isWorker) {
					let messages = await _server.startServer(configPath, configManage, numWorkers, cluster);
					showMessages(messages);
				}
			}
		} else {
			log.logger('info', '|| ********************************************************* ||', 'startUpAll');
			log.logger('info', '|| Processo de inicialização do servidor - clusterizado: NÃO ||', 'startUpAll');
			log.logger('info', '|| ********************************************************* ||', 'startUpAll');

			let messages = await _server.startServer(configPath, configManage, numWorkers);
			showMessages(messages);
		}
	} catch (err) {
		log.logger('error', err.stack || err, 'startUp');
	}
};

configManage.push(configPath)
.then (
	data => {
		global.__serverConfig = Object.freeze(data);
		startApp();
	}
)
.catch (
	err => {
		throw err;
	}
);
