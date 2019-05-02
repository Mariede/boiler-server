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
	'@serverRoot': __dirname
});
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos/Variaveis de apoio
const config = require('@serverRoot/config');
const index = require('@serverRoot/routes/index'); // gate de roteamento
const log = require('@serverRoot/helpers/log');
const checkRoutePrefix = () => (config.server.routePrefix && config.server.routePrefix !== '/' ? config.server.routePrefix : '');
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
			filename: (__serverRoot + '/logs/' + config.server.logFileName),
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
		'origin': config.server.cors.origin,
		'methods': config.server.cors.methods,
		'preflightContinue': config.server.cors.preflightContinue,
		'optionsSuccessStatus': config.server.cors.optionsSuccessStatus
	})
);

// Sessions - inicializando ------------------------------
app.use(
	session({
			name: config.server.session.cookieName,
			store: new sessionFileStore({
				path: (__serverRoot + '/sessions'),
				retries: 5,
				secret: config.server.session.secretStore,
				ttl: 20 * 60 // 1 = 1 segundo (20 minutos)
			}),
			secret: config.server.session.secret,
			resave: false,
			saveUninitialized: false,
			unset: 'destroy',
			cookie: {
				secure: false // true: apenas em https, false: http/https
			}
		}
	)
);

// Body parser, usando JSON ------------------------------
app.use(
	bodyParser.json()
);

// Shallow parsing (string) ou Deep parsing (objeto) -----
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);

// Compressao Gzip ---------------------------------------
app.use(
	compression()
);

// Servindo arquivos estaticos ---------------------------
app.use(
	checkRoutePrefix() + config.server.pathVirtualStaticFiles, express.static(__serverRoot + '/_home/images') // De /img para pasta \images
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
const servidor = http.createServer(app).listen(config.server.port, config.server.host, () => {
	log.logger('info', `Servidor está rodando em ${config.server.host}:${config.server.port} | Prefixo nas rotas: "${checkRoutePrefix()}" | Ambiente: ${process.env.NODE_ENV}...`, 'consoleOnly');
});
// -------------------------------------------------------------------------
