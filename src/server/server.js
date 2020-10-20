'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const ejs = require('ejs');
const favicon = require('serve-favicon');
const http = require('http');
const https = require('https');
const proxy = require('http-proxy');
const session = require('express-session');
const SessionStore = require('session-file-store')(session);
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const configManage = require('@serverRoot/server/config-manage'); // Verifica config.json
const log = require('@serverRoot/helpers/log');
const queue = require('@serverRoot/server/queue'); // Queue de e-mails
const redirectHttpToHttps = require('@serverRoot/server/redirectHttpToHttps');
const routeGate = require('@serverRoot/server/route-gate'); // Gate de roteamento
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia um novo servidor web
const startServer = (cert, configPath, numWorkers, ...cluster) => {
	return new Promise((resolve, reject) => {
		const isHttps = __serverConfig.server.secure.isHttps;

		const pServerCheck = {
			protocol: (isHttps ? https : http),
			serverOptions: (isHttps ? {
				key: cert.key,
				cert: cert.public
			} : {}),
			protocolInfo: (isHttps ? 'https://' : 'http://'),
			sessionCookieSecure: isHttps,
			socketIo: {
				serverProtocol: (isHttps ? 'https://' : 'http://')
			}
		};

		const listenOptions = {
			port: __serverConfig.server.port,
			host: (__serverConfig.server.host !== '' ? __serverConfig.server.host : '0.0.0.0'),
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
						}
					)
				);
			};

			if (Array.isArray(pathVirtualStaticFiles)) {
				pathVirtualStaticFiles.forEach(
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
		//	=> Utiliza variavel global para manter sempre o ID inicial em eventuais "mortes" e "reinicios" do processo
		//	=> Codigo: cluster[0].worker.process.env.workerMyId no lugar de cluster[0].worker.id (incremental)
		if (numWorkers && typeof(cluster[0]) === 'object' && cluster[0] !== null) {
			__serverWorker = cluster[0].worker.process.env.workerMyId;
		}
		// -------------------------------------------------------------------------

		// -------------------------------------------------------------------------
		// Middleware

		// Security Headers --------------------------------------------------------
		app.disable('x-powered-by'); // Desabilita header x-powered-by (hidepoweredby)

		app.use(
			(req, res, next) => {
				res.set('X-Content-Type-Options', 'nosniff'); // Browser sniffing mime types (nosniff)
				res.set('X-DNS-Prefetch-Control', 'off'); // Blocks prefetching DNS requests
				res.set('X-Download-Options', 'noopen'); // Blocks old versions of ie from executing malicious downloads
				res.set('X-XSS-Protection', '1; mode=block'); // Cross Site Scripting (xssfilter)
				next();
			}
		);

		// CORS --------------------------------------------------------------------
		app.use(
			cors(
				{
					origin: __serverConfig.server.cors.origin,
					methods: __serverConfig.server.cors.methods,
					preflightContinue: __serverConfig.server.cors.preflightContinue,
					optionsSuccessStatus: __serverConfig.server.cors.optionsSuccessStatus,
					credentials: __serverConfig.server.cors.credentials
				}
			)
		);

		// Sessions - store no file system -----------------------------------------
		app.use(
			session(
				{
					name: __serverConfig.server.session.cookieName,
					store: new SessionStore(
						{
							logFn: err => {
								log.logger('warn', (err.stack || err));
							},
							path: `${__serverRoot}/sessions`,
							encoding: 'utf8',
							retries: 5,
							secret: __serverConfig.server.session.secretStore,
							reapInterval: 60 * __serverConfig.server.session.timeout * 0.75, // 1 = 1 segundo (timeout em minutos)
							ttl: 60 * __serverConfig.server.session.timeout // 1 = 1 segundo (timeout em minutos)
						}
					),
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
			bodyParser.urlencoded(
				{
					extended: true
				}
			)
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
			`${__serverRoot}/views/server-side/pages`
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

		// Middleware de seguranca - parametros querystring ------------------------
		app.use(
			(req, res, next) => {
				Object.entries(req.query).forEach(
					([qKey, qValue]) => {
						if (typeof qValue !== 'string') {
							req.query[qKey] = '';
						}
					}
				);
				next();
			}
		);

		// Rotas -------------------------------------------------------------------
		app.use(
			checkRoutePrefix(),
			routeGate
		);

		// Cria servidor -----------------------------------------------------------
		const _server = pServerCheck.protocol.createServer(pServerCheck.serverOptions, app);

		_server.maxConnections = __serverConfig.server.maxConnections;
		_server.timeout = __serverConfig.server.timeout * 1000;
		_server.keepAliveTimeout = __serverConfig.server.keepAliveTimeout * 1000;
		_server.maxHeadersCount = __serverConfig.server.maxHeadersCount;
		_server.headersTimeout = __serverConfig.server.headersTimeout * 1000;

		// Proxy para o servidor de Websockets (Socket.io) -------------------------
		// Se mais de uma aplicacao estiver rodando no mesmo servidor, diferenciar pelas portas em config
		const wsProxy = proxy.createProxyServer(
			{
				secure: false,
				target: `${pServerCheck.socketIo.serverProtocol}${(__serverConfig.socketIo.serverHost !== '' ? __serverConfig.socketIo.serverHost : '0.0.0.0')}:${__serverConfig.socketIo.serverPort}`,
				ws: true
			}
		);

		// Listener para erros de proxy
		wsProxy.on(
			'error',
			(err, req, res) => {
				log.logger('error', `[http-proxy] ${(err.stack || err)}`);
				res.end();
			}
		);

		// Rotas de resposta para socket.io ----------------------------------------
		app.all( // Pooling
			`${__serverConfig.socketIo.path}/*`,
			(req, res) => {
				wsProxy.web(
					req,
					res,
					{
						cookiePathRewrite: false,
						changeOrigin: __serverConfig.socketIo.changeOrigin
					}
				);
			}
		);

		_server.on( // Websockets
			'upgrade',
			(req, socket, head) => {
				wsProxy.ws(
					req,
					socket,
					head,
					{
						cookiePathRewrite: false,
						changeOrigin: __serverConfig.socketIo.changeOrigin
					}
				);
			}
		);

		// Rotas nao encontradas ---------------------------------------------------
		app.all(
			'*',
			(req, res) => {
				res.status(404).send(
					{
						name: 'ROUTER',
						code: 404,
						message: 'Essa rota não existe...'
					}
				);
			}
		);

		// Handler erros oriundos dos controllers ----------------------------------
		app.use(
			(err, req, res, next) => { // eslint-disable-line no-unused-vars
				log.errorsController(res, err, 'error');
			}
		);
		// -------------------------------------------------------------------------

		// -------------------------------------------------------------------------
		// Inicia servidor
		const serverStarter = async () => {
			try {
				const eventLoopMonitor = () => {
				// Monitora o loop de eventos no servidor, para analise de performance e testes de desenvolvimento
				// Evitar usar em producao, desabilitando esta opcao em config
					const start = Date.now();

					setTimeout(() => {
						try {
							const eventLooplag = Date.now() - start;
							const eventLooplagTrigger = 50; // Em milisegundos

							if (eventLooplag > eventLooplagTrigger) {
								log.logger('warn', `Loop de eventos deste servidor reportou lag acentuado: ${eventLooplag} ms`, 'startUp');
							}

							eventLoopMonitor();
						} catch (err) {
							log.logger('error', `[web-servidor] ${(err.stack || err)}`);
						}
					}, 0);
				};

				const messages = [];

				messages.push(['info', `Servidor está rodando em ${pServerCheck.protocolInfo}${listenOptions.host}:${listenOptions.port} | Prefixo nas rotas: "${checkRoutePrefix()}" | Ambiente: ${process.env.NODE_ENV}...`]);

				// Inicia gerenciamento do arquivo de configuracao do servidor
				const resultConfig = configManage.check(configPath);
				const fileName = configPath.split(/[\\/]/).pop();

				if (typeof resultConfig === 'object' && resultConfig !== null) {
					messages.push(['info', `Arquivo de configuração em ${fileName} está sendo observado por mudanças`]);
				} else {
					messages.push(['error', `Arquivo de configuração em ${fileName} falhou ao iniciar procedimento de observação automática por mudanças...`]);
				}

				// Inicia o gerenciamento da pasta de e-mails para envios em fila (queue)
				if (__serverConfig.email.queue.on) {
					try {
						const resultQueue = await queue.queueStartMailCheck();

						if (typeof resultQueue === 'object' && resultQueue !== null) {
							messages.push(['info', `Serviço de fila de e-mails iniciado com sucesso${__serverConfig.email.queue.saveFullLogs ? ' (logs completos)' : ''}`]);
						} else {
							messages.push(['error', 'Serviço de fila de e-mails falhou ao iniciar...']);
						}
					} catch (err) {
						messages.push(['error', `Serviço de fila de e-mails falhou ao iniciar: ${(err.stack || err)}`]);
					}
				} else {
					messages.push(['info', 'Serviço de fila de e-mails não habilitado']);
				}

				// Inicia o monitoramento do loop de eventos no servidor
				if (__serverConfig.server.eventLoopMonitor) {
					try {
						eventLoopMonitor();
						messages.push(['info', 'Monitoramento do loop de eventos no servidor habilitado (testes de performance)']);
					} catch (err) {
						messages.push(['error', `Monitoramento do loop de eventos no servidor falhou ao iniciar: ${(err.stack || err)}`]);
					}
				} else {
					messages.push(['info', 'Monitoramento do loop de eventos no servidor não habilitado (padrão)']);
				}

				if (isHttps) {
					try {
						const resultRedirectHttpToHttps = await redirectHttpToHttps.startRedirectHttpToHttps(listenOptions.host, listenOptions.port);

						switch (resultRedirectHttpToHttps) {
							case -1: {
								messages.push(['info', 'Redirecionamento http -> https NÃO ativo (porta de redirecionamento não definida)']);
								break;
							}
							case -2: {
								messages.push(['error', 'Redirecionamento http -> https NÃO ativo (porta de redirecionamento inválida)']);
								break;
							}
							default: {
								messages.push(['info', `Redirecionamento http -> https ativo na porta ${resultRedirectHttpToHttps}`]);
							}
						}
					} catch (err) {
						messages.push(['error', `Redirecionamento http -> https falhou ao iniciar: ${(err.stack || err)}`]);
					}
				} else {
					messages.push(['info', 'Redirecionamento http -> https NÃO ativo (https desabilitado)']);
				}

				resolve(messages);
			} catch (err) {
				reject(err);
			}
		};

		_server.listen(listenOptions, serverStarter()).on(
			'error',
			err => {
				log.logger('error', `[web-servidor] ${(err.stack || err)}`);
			}
		);
	});
};
// -------------------------------------------------------------------------

module.exports = {
	startServer
};
