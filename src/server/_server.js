'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const proxy = require('http-proxy');
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
const queue = require('@serverRoot/server/queue'); // Queue de e-mails
const routes = require('@serverRoot/routes/routes'); // Gate de roteamento
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

const startServer = (configPath, configManage, numWorkers, ...cluster) => {
	return new Promise((resolve, reject) => {
		try {
			const isHttps = __serverConfig.server.isHttps;

			const pServerCheck = {
				protocol: (isHttps ? https : http),
				serverOptions: (isHttps ? {} : {}),
				sessionCookieSecure: (isHttps ? true : false)
			};

			const listenOptions = {
				port: __serverConfig.server.port,
				host: __serverConfig.server.host,
				backlog: __serverConfig.server.backlog
			};

			// -------------------------------------------------------------------------
			// Procedimentos prioritarios

			// Definindo pastas de conteudo estatico
			const checkPathStaticFiles = pathVirtualStaticFiles => {
				const setPathStaticFiles = p => {
					app.use(
						p.virtualPath,
						express.static(
							__serverRoot + p.physicalPath, {
							etag: true,
							lastModified: true,
							maxAge: 1000 * 60 * p.maxAge // 1000 = 1 segundo (timeout em minutos)
						})
					);
				};

				if (Array.isArray(pathVirtualStaticFiles)) {
					pathVirtualStaticFiles.forEach (
						path => {
							setPathStaticFiles(path);
						}
					);
				}
			};

			// Acessando rotas prefixadas
			const checkRoutePrefix = () => {
				const routePrefix = __serverConfig.server.routePrefix;
				return (routePrefix && routePrefix !== '/' ? routePrefix : '');
			};

			// Server Worker identifica o cluster trabalhador, se existir
			//    => Utiliza variavel global para manter sempre o ID inicial em eventuais "mortes" e "reinicios" do processo
			//    => Codigo: cluster[0].worker.process.env.workerMyId no lugar de cluster[0].worker.id (incremental)
			if (numWorkers && typeof(cluster[0]) === 'object') {
				__serverWorker = cluster[0].worker.process.env.workerMyId;
			}
			// -------------------------------------------------------------------------

			// -------------------------------------------------------------------------
			// Middleware

			// Headers (seguranca) -----------------------------------------------------
			app.disable('x-powered-by'); // Desabilita header x-powered-by (hidepoweredby)

			app.use((req, res, next) => {
				res.set('X-Content-Type-Options', 'nosniff'); // Browser sniffing mime types (nosniff)
				res.set('X-XSS-Protection', '1; mode=block'); // Cross Site Scripting (xssfilter)
				next();
			});

			// CORS --------------------------------------------------------------------
			app.use(
				cors({
					'origin': __serverConfig.server.cors.origin,
					'methods': __serverConfig.server.cors.methods,
					'preflightContinue': __serverConfig.server.cors.preflightContinue,
					'optionsSuccessStatus': __serverConfig.server.cors.optionsSuccessStatus,
					'credentials': __serverConfig.server.cors.credentials
				})
			);

			// Sessions - store no file system -----------------------------------------
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
							httpOnly: true,
							sameSite: true, // Opcoes => true | false | lax | none | strict
							secure: pServerCheck.sessionCookieSecure, // Opcoes => true: apenas em https, false: http/https
							maxAge: 1000 * 60 * __serverConfig.server.session.timeout // 1000 = 1 segundo (timeout em minutos)
						}
					}
				)
			);

			// Body parser, application/json -------------------------------------------
			app.use(
				bodyParser.json()
			);

			// Body parser, application/x-www-form-urlencoded --------------------------
			app.use(
				bodyParser.urlencoded({
					extended: true
				})
			);

			// Cookie parser (req.cookies) ---------------------------------------------
			app.use(
				cookieParser()
			);

			// Compressao Gzip ---------------------------------------------------------
			app.use(
				compression()
			);

			// Servindo arquivos estaticos ---------------------------------------------
			checkPathStaticFiles(__serverConfig.server.pathVirtualStaticFiles);

			// Favicon -----------------------------------------------------------------
			app.use(
				favicon(__serverRoot + __serverConfig.server.pathFavicon)
			);

			// Views -------------------------------------------------------------------

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

			// Rotas -------------------------------------------------------------------
			app.use(
				checkRoutePrefix(),
				routes
			);

			app.all('*', (req, res) => {
				res.status(404).send({
					name: 'ROUTER',
					code: 404,
					message: 'Essa rota não existe...'
				});
			});

			// Cria servidor -----------------------------------------------------------
			const _server = pServerCheck.protocol.createServer(pServerCheck.serverOptions, app);

			_server.maxConnections = __serverConfig.server.maxConnections;
			_server.timeout = __serverConfig.server.timeout * 1000;
			_server.keepAliveTimeout = __serverConfig.server.keepAliveTimeout * 1000;
			_server.maxHeadersCount = __serverConfig.server.maxHeadersCount;
			_server.headersTimeout = __serverConfig.server.headersTimeout * 1000;

			// Proxy para o servidor de Websockets (Socket.io) -------------------------
			// Se mais de uma aplicacao estiver rodando no mesmo servidor, diferenciar pelas portas em config
			const wsProxy = proxy.createProxyServer({
				target: `${__serverConfig.socketIo.serverProtocol}${__serverConfig.socketIo.serverHost}:${__serverConfig.socketIo.serverPort}`,
				ws: true
			});

			// Listener para erros de proxy
			wsProxy.on('error', (err, req, res) => {
				log.logger('error', err.stack || err);
				res.end();
			});

			// Rotas de resposta para socket.io ---------------------------------------
			app.all(`${__serverConfig.socketIo.path}/*`, (req, res) => {
				wsProxy.web(req, res);
			});

			_server.on('upgrade', (req, socket, head) => {
				wsProxy.ws(req, socket, head);
			});

			// Handler erros sincronos -------------------------------------------------
			app.use((err, req, res, next) => {
				reject(err);
			});
			// -------------------------------------------------------------------------

			// -------------------------------------------------------------------------
			// Inicia servidor ouvindo em host:port
			const serverStarter = async () => {
				try {
					const eventLoopMonitor = () => {
					// Monitora o loop de eventos no servidor, para analise de performance e testes de desenvolvimento
					// Evitar usar em producao, desabilitando esta opcao em config
						const start = Date.now();

						setTimeout(() => {
							const eventLooplag = Date.now() - start;
							const eventLooplagTrigger = 50; // Em milisegundos

							if (eventLooplag > eventLooplagTrigger) {
								log.logger('warn', `Loop de eventos deste servidor reportou lag acentuado: ${eventLooplag} ms`, 'consoleOnly');
							}

							eventLoopMonitor();
						}, 0);
					};

					let messages = [];

					messages.push(['info', `Servidor está rodando em ${listenOptions.host}:${listenOptions.port} | Prefixo nas rotas: "${checkRoutePrefix()}" | Ambiente: ${process.env.NODE_ENV}...`]);

					// Inicia gerenciamento do arquivo de configuracao do servidor
					let resultConfig = await configManage.check(configPath),
						fileName = path.basename(configPath);

					if (typeof resultConfig === 'object' && resultConfig !== null) {
						messages.push(['info', `Arquivo de configuração em ${fileName} está sendo observado por mudanças`]);
					} else {
						messages.push(['error', `Arquivo de configuração em ${fileName} falhou ao iniciar procedimento de observação automática por mudanças...`]);
					}

					// Inicia o gerenciamento da pasta de e-mails para envios em fila (queue)
					if (__serverConfig.email.queue.on) {
						let resultQueue = await queue.queueStartMailCheck();

						if (typeof resultQueue === 'object' && resultQueue !== null) {
							messages.push(['info', `Serviço de fila de e-mails iniciado com sucesso${__serverConfig.email.queue.saveFullLogs ? ' (logs completos)' : ''}`]);
						} else {
							messages.push(['error', 'Serviço de fila de e-mails falhou ao iniciar...']);
						}
					} else {
						messages.push(['info', 'Serviço de fila de e-mails não habilitado']);
					}

					// Inicia o monitoramento do loop de eventos no servidor
					if (__serverConfig.server.eventLoopMonitor) {
						eventLoopMonitor();
						messages.push(['info', 'Monitoramento do loop de eventos no servidor habilitado (testes de performance)']);
					} else {
						messages.push(['info', 'Monitoramento do loop de eventos no servidor não habilitado (padrão)']);
					}

					resolve(messages);
				} catch (err) {
					reject(err);
				}
			};

			_server.listen(listenOptions, serverStarter());
		} catch (err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	startServer
};
