// -------------------------------------------------------------------------
// Modulos de inicializacao
const express = require('express');
const app = express();
const http = require('http');
const httpProxy = require('http-proxy');
const apiProxy = httpProxy.createProxyServer();
const log4js = require('log4js');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos/Variaveis de apoio
const serversToProxy = [['/APP1/*', 'http://localhost:5000'], ['/APP2/*', 'http://localhost:5000']];
const serverPort = 80;
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Middleware

// logs --------------------------------------------------
log4js.configure({
	appenders: {
		consoleAppender: {
			type: 'console'
		}
	},
	categories: {
		default: { appenders: ['consoleAppender'], level: 'all' }
	}
});

// proxy -------------------------------------------------
serversToProxy.forEach(
	server => {
		let path = server[0],
			origin = server[1];

		app.all(path, (req, res) => {
			log4js.getLogger('default').info(`Redirecionando para ${path} (${origin})`);

			apiProxy.web(req, res,
				{
					/* para https ------- */
					// target: {
					// 	protocol: 'https:',
					// 	host: 'my-domain-name',
					// 	port: 443,
					// 	pfx: fs.readFileSync('path/to/certificate.p12'),
					// 	passphrase: 'password',
					// },
					/* ------------------ */
					target: origin,
					cookiePathRewrite: false,
					changeOrigin: true
				}
			);
		});
	}
);

// Rotas -------------------------------------------------
app.get('/', (req, res) => {
	res.status(200).send(`<html><body><center><h4>Bem vindo, servidor de proxy está rodando na porta ${serverPort} ...</h4></center></body></html>`);
});

app.all('*', (req, res) => {
	res.status(404).send('Essa rota não existe no servidor de proxy');
});

// Handler erros -----------------------------------------
apiProxy.on('error', (err, req, res, next) => {
	log4js.getLogger('default').error(err.stack || err);
	res.status(500).send('Erro no servidor de proxy (apiProxy)');
});

app.use((err, req, res, next) => {
	log4js.getLogger('default').error(err.stack || err);
	res.status(500).send('Erro no servidor de proxy');
});
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia servidor de proxy ouvindo na porta serverPort
http.createServer(app).listen(serverPort, function() {
	log4js.getLogger('default').info(`Servidor de proxy está rodando na porta ${serverPort} ...`);
});
// -------------------------------------------------------------------------
