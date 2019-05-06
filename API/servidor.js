"use strict";

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
const compression = require('compression');
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
const index = require('@serverRoot/routes/index'); // gate de roteamento
const log = require('@serverRoot/helpers/log');
const configManage = require('@serverRoot/helpers/configManage');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Procedimento prioritarios

// Acessando e gerindo informacoes do arquivo de configuracoes do servidor
const configPath = __serverRoot + '/config.json';

global.__serverConfig = configManage.push(configPath);

configManage.check(configPath)
.catch(err => {
	log.logger('error', err.stack || err);
});

// Acessando rotas prefixadas
const checkRoutePrefix = () => (__serverConfig.server.routePrefix && __serverConfig.server.routePrefix !== '/' ? __serverConfig.server.routePrefix : '');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware

// logs --------------------------------------------------
log4js.configure({
	appenders: {
		consoleAppender: {
			type: 'console'
		},
		fileAppender: {
			type: 'dateFile',
			filename: (__serverRoot + '/logs/' + __serverConfig.server.logFileName),
			pattern: '.yyyy-MM-dd',
			daysToKeep: 15,
			compress: true
		}
	},
	categories: {
		default: { appenders: ['consoleAppender', 'fileAppender'], level: 'warn' },
		consoleOnly: { appenders: ['consoleAppender'], level: 'all' },
		fileOnly: { appenders: ['fileAppender'], level: 'warn' }
	}
});

// Favicon -----------------------------------------------
app.use(
	favicon(__serverRoot + '/_home/images/favicon.ico')
);

// CORS --------------------------------------------------
app.use(
	cors({
		'origin': __serverConfig.server.cors.origin,
		'methods': __serverConfig.server.cors.methods,
		'preflightContinue': __serverConfig.server.cors.preflightContinue,
		'optionsSuccessStatus': __serverConfig.server.cors.optionsSuccessStatus
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
				ttl: 20 * 60 // 1 = 1 segundo (20 minutos)
			}),
			secret: __serverConfig.server.session.secret,
			resave: false,
			saveUninitialized: false,
			unset: 'destroy',
			cookie: {
				secure: false // true: apenas em https, false: http/https
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

// Compressao Gzip ---------------------------------------
app.use(
	compression()
);

// Servindo arquivos estaticos ---------------------------
app.use(
	checkRoutePrefix() + __serverConfig.server.pathVirtualStaticFiles, express.static(__serverRoot + '/_home/images') // De /img para pasta \images
);

// Rotas -------------------------------------------------
app.use(
	checkRoutePrefix(),
	index
);

app.all('*', (req, res) => {
	res.status(404).json('Essa rota não existe');
});

// Handler erros sincronos -------------------------------
app.use((err, req, res, next) => {
	log.logger('error', err.stack || err);
	res.status(500).json('Erro no servidor');
});
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia servidor ouvindo em host:port (sem certificado https)
const servidor = http.createServer(app).listen(__serverConfig.server.port, __serverConfig.server.host, () => {
	log.logger('info', `Servidor está rodando em ${__serverConfig.server.host}:${__serverConfig.server.port} | Prefixo nas rotas: "${checkRoutePrefix()}" | Ambiente: ${process.env.NODE_ENV}...`, 'consoleOnly');
});
// -------------------------------------------------------------------------