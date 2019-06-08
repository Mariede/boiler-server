'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const express = require('express');
const app = express();
const http = require('http');
const favicon = require('serve-favicon');
const cors = require('cors');
const session = require('express-session');
const sessionFileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const log4js = require('log4js');
const moduleAlias = require('module-alias');
const path = require('path');
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
const index = require('@serverRoot/routes/index'); // gate de roteamento
const log = require('@serverRoot/helpers/log');
const configManage = require('@serverRoot/helpers/configManage');
const queue = require('@serverRoot/helpers/queue');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Procedimentos prioritarios

// Acessando informacoes do arquivo de configuracoes do servidor
const configPath = __serverRoot + '/config.json';
global.__serverConfig = configManage.push(configPath);

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
	return (__serverConfig.server.routePrefix && __serverConfig.server.routePrefix !== '/' ? __serverConfig.server.routePrefix : '');
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware

// logs --------------------------------------------------
log4js.configure({
	appenders: {
		consoleAppender: {
			type: 'console'
		},
		startUpAppender: {
			type: 'dateFile',
			filename: (__serverRoot + '/logs/' + __serverConfig.server.logStartUp),
			pattern: '.yyyy-MM-dd',
			daysToKeep: 15,
			compress: false
		},
		fileAppender: {
			type: 'dateFile',
			filename: (__serverRoot + '/logs/' + __serverConfig.server.logFileName),
			pattern: '.yyyy-MM-dd',
			daysToKeep: 15,
			compress: false
		},
		mailQueueAppender: {
			type: 'dateFile',
			filename: (__serverRoot + '/logs/' + __serverConfig.server.logMailQueueFileName),
			pattern: '.yyyy-MM-dd',
			daysToKeep: 15,
			compress: false
		}
	},
	categories: {
		default: { appenders: ['consoleAppender', 'fileAppender'], level: 'warn' },
		startUp: { appenders: ['consoleAppender', 'startUpAppender'], level: 'all' },
		consoleOnly: { appenders: ['consoleAppender'], level: 'all' },
		fileOnly: { appenders: ['fileAppender'], level: 'warn' },
		mailQueue: { appenders: ['consoleAppender', 'mailQueueAppender'], level: 'warn' }
	}
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

// Engine padrao
app.set(
	'view engine',
	'ejs'
);

// Caminho padrao
app.set(
	'views',
	__serverRoot + '/views'
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
	log.logger('error', err.stack || err);
	res.status(500).send(err.stack || err);
});
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia servidor ouvindo em host:port (sem certificado https)
http.createServer(app).listen(__serverConfig.server.port, __serverConfig.server.host, () => {
	log.logger('info', '>>> --- --- --- --- --- --- --- >>>   Servidor ouvindo   <<< --- --- --- --- --- --- --- <<<', 'startUp');

	log.logger('info', `Servidor está rodando em ${__serverConfig.server.host}:${__serverConfig.server.port} | Prefixo nas rotas: "${checkRoutePrefix()}" | Ambiente: ${process.env.NODE_ENV}...`, 'startUp');

	// inicia gerenciamento do arquivo de configuracao do servidor
	configManage.check(configPath)
	.then(result => {
		let fileName = path.basename(configPath);

		if (typeof result === 'object') {
			log.logger('info', `Arquivo de configuração em ${fileName} está sendo observado por mudanças`, 'startUp');
		} else {
			log.logger('error', `Arquivo de configuração em ${fileName} falhou ao iniciar procedimento de observação automática por mudanças...`, 'startUp');
		}
	})
	.catch(err => {
		log.logger('error', err.stack || err, 'startUp');
	});

	// inicia o gerenciamento da pasta de e-mails para envios em fila (queue)
	if (__serverConfig.email.queue.on) {
		queue.queueStartMailCheck()
		.then(result => {
			if (typeof result === 'object') {
				log.logger('info', 'Serviço de fila de e-mails iniciado com sucesso', 'startUp');
			} else {
				log.logger('error', 'Serviço de fila de e-mails falhou ao iniciar...', 'startUp');
			}
		})
		.catch(err => {
			log.logger('error', err.stack || err, 'startUp');
		});
	} else {
		log.logger('info', 'Serviço de fila de e-mails não habilitado', 'startUp');
	}
});
// -------------------------------------------------------------------------
