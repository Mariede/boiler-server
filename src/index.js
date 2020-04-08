'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const cluster = require('cluster');
const os = require('os');
const log4js = require('log4js');
const moduleAlias = require('module-alias');
const fs = require('fs');
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
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

const startApp = async (cert, configPath) => {
	try {
		const showMessages = messages => {
			let checkType = 'info',
				messagesCheckType = '',
				padStart = ''.padStart(43) + '-> ',
				i = 0;

			messages.forEach (
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
			socketIo.startIo(cert);
		}

		if (numWorkers) {
			if (cluster.isMaster) {
				log.logger('info', '|| ********************************************************* ||', 'startUpAll');
				log.logger('info', '|| Processo de inicialização do servidor - clusterizado: SIM ||', 'startUpAll');
				log.logger('info', '|| ********************************************************* ||', 'startUpAll');

				log.logger('info', `Cluster mestre definindo ${numWorkers} trabalhadores`, 'startUp');

				for (let i = 0; i < numWorkers; i++) {
					let env = { workerMyId: i + 1 },
						newWorker = cluster.fork(env);
					newWorker.process.myEnv = env;
				}

				cluster.on (
					'online',
					worker => {
						log.logger('info', `Cluster ${worker.process.pid}, trabalhador ${worker.process.myEnv.workerMyId} - está ativo`, 'startUp');
					}
				);

				cluster.on (
					'exit',
					(worker, code, signal) => {
						log.logger('info', `Cluster ${worker.process.pid}, trabalhador ${worker.process.myEnv.workerMyId} - finalizou os serviços${(signal ? ' pelo sinal ' + signal : ' com o código ' + code)}`, 'startUp');
						log.logger('info', 'Iniciando novo trabalhador', 'startUp');

						let env = worker.process.myEnv,
							newWorker = cluster.fork(env);
						newWorker.process.myEnv = env;
					}
				);
			} else {
				if (cluster.isWorker) {
					let messages = await _server.startServer(cert, configPath, numWorkers, cluster);
					showMessages(messages);
				}
			}
		} else {
			log.logger('info', '|| ********************************************************* ||', 'startUpAll');
			log.logger('info', '|| Processo de inicialização do servidor - clusterizado: NÃO ||', 'startUpAll');
			log.logger('info', '|| ********************************************************* ||', 'startUpAll');

			let messages = await _server.startServer(cert, configPath, numWorkers);
			showMessages(messages);
		}
	} catch (err) {
		log.logger('error', err.stack || err, 'startUp');
	}
};

const preStartApp = async () => {
	try {
		const getAppConfigData = async path => {
			const fsPromises = fs.promises;
			return JSON.parse(await fsPromises.readFile(path, 'utf8'));
		};

		const getAppCert = async () => {
			const fsPromises = fs.promises;

			let result = {};

			if (__serverConfig.server.secure.isHttps) {
				const certPath = __serverRoot + __serverConfig.server.secure.certFolder + '\\';
				const certKey = certPath + __serverConfig.server.secure.certKey;
				const certPublic = certPath + __serverConfig.server.secure.certPublic;

				result.key = await fsPromises.readFile(certKey, 'utf8');
				result.public = await fsPromises.readFile(certPublic, 'utf8');
			}

			return result;
		};

		// Caminho para o arquivo de configuracoes do servidor
		const configPath = __serverRoot + '/config.json';

		// Variaveis globais
		global.__serverConfig = Object.freeze(await getAppConfigData(configPath)); // Configuracoes do servidor
		global.__serverWorker = null; // Server Worker inicialmente sem cluster (trabalhador unico)

		// Certificado digital (apenas se ativo)
		const myCert = await getAppCert();

		startApp(myCert, configPath);
	} catch (err) {
		console.error(err);
	}
};

preStartApp();
