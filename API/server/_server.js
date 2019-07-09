'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const express = require('express');
const app = express();
const _server = require('http').Server(app);
const io = require('socket.io')(_server);
const cors = require('cors');
const session = require('express-session');
const sessionFileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const favicon = require('serve-favicon');
const ejs = require('ejs');
const path = require('path');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const socketIoListeners = require('@serverRoot/server/socketIoListeners'); // listeners agrupados (socket.io)
const queue = require('@serverRoot/server/queue'); // queue de e-mails
const index = require('@serverRoot/routes/index'); // gate de roteamento
// -------------------------------------------------------------------------

const iniciar = (configPath, configManage, numWorkers, ...clusterId) => {
	return new Promise((resolve, reject) => {
		try {
			const serverHost = (process.env.HOSTNAME || __serverConfig.server.host);
			const serverPort = (process.env.PORT || __serverConfig.server.port);
			const serverEnv = process.env.NODE_ENV;
			const routePrefix = __serverConfig.server.routePrefix;

			// -------------------------------------------------------------------------
			// Procedimentos prioritarios

			// Server Worker identifica ID do trabalhador (cluster) se existir
			if (numWorkers && clusterId[0]) {
				__serverWorker = clusterId[0];
			}

			// Definindo pastas de conteudo estatico
			const checkPathStaticFiles = pathVirtualStaticFiles => {
				const setPathStaticFiles = (virtualPath, physicalPath) => {
					app.use(
						virtualPath, express.static(__serverRoot + physicalPath)
					);
				};

				if (Array.isArray(pathVirtualStaticFiles)) {
					pathVirtualStaticFiles.forEach(
						path => {
							setPathStaticFiles(path.virtualPath, path.physicalPath);
						}
					);
				}
			};

			// Acessando rotas prefixadas
			const checkRoutePrefix = () => {
				return (routePrefix && routePrefix !== '/' ? routePrefix : '');
			};
			// -------------------------------------------------------------------------

			// -------------------------------------------------------------------------
			// Middleware

			// SOCKET.IO ---------------------------------------------
			socketIoListeners.listenersRoot(io);

			app.use((req, res, next) => {
				req.io = io;
				next();
			});

			// CORS --------------------------------------------------
			app.use(
				cors({
					'origin': __serverConfig.server.cors.origin,
					'methods': __serverConfig.server.cors.methods,
					'preflightContinue': __serverConfig.server.cors.preflightContinue,
					'optionsSuccessStatus': __serverConfig.server.cors.optionsSuccessStatus,
					'credentials': __serverConfig.server.cors.credentials
				})
			);

			// Sessions - store no file system -----------------------
			app.use(
				session({
						name: __serverConfig.server.session.cookieName,
						store: new sessionFileStore({
							path: (__serverRoot + '/sessions'),
							retries: 5,
							secret: __serverConfig.server.session.secretStore,
							ttl: 60 * __serverConfig.server.session.timeout // 1 = 1 segundo (timeout em minutos)
						}),
						secret: __serverConfig.server.session.secret,
						resave: false,
						saveUninitialized: false,
						unset: 'destroy',
						rolling: true,
						cookie: {
							secure: false, // true: apenas em https, false: http/https
							maxAge: 1000 * 60 * __serverConfig.server.session.timeout // 1000 = 1 segundo (timeout em minutos)
						}
					}
				)
			);

			// Body parser, application/json -------------------------
			app.use(
				bodyParser.json()
			);

			// Body parser, application/x-www-form-urlencoded --------
			app.use(
				bodyParser.urlencoded({
					extended: true
				})
			);

			// Cookie parser (req.cookies) ---------------------------
			app.use(
				cookieParser()
			);

			// Compressao Gzip ---------------------------------------
			app.use(
				compression()
			);

			// Servindo arquivos estaticos ---------------------------
			checkPathStaticFiles(__serverConfig.server.pathVirtualStaticFiles);

			// Favicon -----------------------------------------------
			app.use(
				favicon(__serverRoot + __serverConfig.server.pathFavicon)
			);

			// Views -------------------------------------------------

			// Caminho padrao
			app.set(
				'views',
				__serverRoot + '/views/serverSide/pages'
			);

			// Engine padrao
			app.set(
				'view engine',
				'ejs'
			);

			// Extensoes da engine (e webpack)
			app.engine(
				'ejs',
				ejs.__express
			);

			// Rotas -------------------------------------------------
			app.use(
				checkRoutePrefix(),
				index
			);

			app.all('*', (req, res) => {
				res.status(404).send('Essa rota não existe');
			});

			// Handler erros sincronos -------------------------------
			app.use((err, req, res, next) => {
				reject(err);
			});
			// -------------------------------------------------------------------------

			// -------------------------------------------------------------------------
			// Inicia servidor ouvindo em host:port
			const serverStarter = async s => {
				try {
					let messages = [];
					messages.push(['info', `Servidor está rodando em ${serverHost}:${serverPort} | Prefixo nas rotas: "${checkRoutePrefix()}" | Ambiente: ${serverEnv}...`]);

					// inicia gerenciamento do arquivo de configuracao do servidor
					let resultConfig = await configManage.check(configPath),
						fileName = path.basename(configPath);

					if (typeof resultConfig === 'object') {
						messages.push(['info', `Arquivo de configuração em ${fileName} está sendo observado por mudanças`]);
					} else {
						messages.push(['error', `Arquivo de configuração em ${fileName} falhou ao iniciar procedimento de observação automática por mudanças...`]);
					}

					// inicia o gerenciamento da pasta de e-mails para envios em fila (queue)
					if (__serverConfig.email.queue.on) {
						let resultQueue = await queue.queueStartMailCheck();

						if (typeof resultQueue === 'object') {
							messages.push(['info', 'Serviço de fila de e-mails iniciado com sucesso']);
						} else {
							messages.push(['error', 'Serviço de fila de e-mails falhou ao iniciar...']);
						}
					} else {
						messages.push(['info', 'Serviço de fila de e-mails não habilitado']);
					}

					s.setTimeout(__serverConfig.server.timeout * 1000);

					resolve(messages);
				} catch(err) {
					reject(err);
				}
			};

			_server.listen(serverPort, serverHost, serverStarter(_server));
		} catch(err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	iniciar
};
