'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const cluster = require('cluster');
const os = require('os');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const socketIo = require('@serverRoot/server/socketIo'); // Lib socket.io
const server = require('@serverRoot/server/server');
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

const startApp = async (cert, configPath) => {
	try {
		const showMessages = messages => {
			const checkType = 'info';
			const padStart = ''.padStart(43) + '-> ';

			let messagesCheckType = '',
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

		if (numWorkers) {
			if (cluster.isMaster) {
				log.logger('info', '|| ********************************************************* ||', 'startUpAll');
				log.logger('info', '|| Processo de inicialização do servidor - clusterizado: SIM ||', 'startUpAll');
				log.logger('info', '|| ********************************************************* ||', 'startUpAll');

				await socketIo.startIo(cert);

				log.logger('info', `Cluster mestre definindo ${numWorkers} trabalhadores`, 'startUp');

				for (let i = 0; i < numWorkers; i++) {
					const env = { workerMyId: i + 1 };
					const newWorker = cluster.fork(env);

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

						const env = worker.process.myEnv;
						const newWorker = cluster.fork(env);

						newWorker.process.myEnv = env;
					}
				);
			} else {
				if (cluster.isWorker) {
					const messages = await server.startServer(cert, configPath, numWorkers, cluster);
					showMessages(messages);
				}
			}
		} else {
			log.logger('info', '|| ********************************************************* ||', 'startUpAll');
			log.logger('info', '|| Processo de inicialização do servidor - clusterizado: NÃO ||', 'startUpAll');
			log.logger('info', '|| ********************************************************* ||', 'startUpAll');

			await socketIo.startIo(cert);

			const messages = await server.startServer(cert, configPath, numWorkers);
			showMessages(messages);
		}
	} catch (err) {
		log.logger('error', err.stack || err, 'startUp');
	}
};

module.exports = {
	startApp
};
