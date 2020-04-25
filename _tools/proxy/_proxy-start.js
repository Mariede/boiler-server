'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const log4js = require('log4js');
// -------------------------------------------------------------------------

const startProxy = () => {
	return new Promise((resolve, reject) => {
		// logs --------------------------------------------------
		log4js.configure (
			{
				appenders: {
					consoleAppender: {
						type: 'console'
					}
			},
				categories: {
					default: {
						appenders: ['consoleAppender'], level: 'all'
					}
			}
		});

		// servidor  web -----------------------------------------
		const getAppCert = () => { // Certificado digital (apenas se ativo)
			const result = {};

			if (isHttps) {
				const certPath = __dirname +  '/cert/';
				const certKey = certPath + 'cert.key';
				const certPublic = certPath + 'cert.pem';

				result.key = fs.readFileSync(certKey, 'utf8');
				result.public = fs.readFileSync(certPublic, 'utf8');
			}

			return result;
		};

		const isHttps = false;
		const cert = getAppCert();

		const pServerCheck = {
			protocol: (isHttps ? https : http),
			serverOptions: (isHttps ? {
				key: cert.key,
				cert: cert.public
			} : {}),
			protocolInfo: (isHttps ? 'https://' : 'http://')
		};

		const listenOptions = {
			port: 80,
			host: 'localhost'
		};

		const _server = pServerCheck.protocol.createServer(pServerCheck.serverOptions, app);

		// proxy -------------------------------------------------
		const wsProxy = httpProxy.createProxyServer (
			{
				secure: false
			}
		);

		const serversToProxy = [['/APP1', 'http://localhost:5000', true],['/APP2', 'http://localhost:5001', false]];

		serversToProxy.forEach (
			serverData => {
				const path = serverData[0];
				const origin = serverData[1];
				const wsOn = serverData[2];

				app.all (
					`${path}/*`,
					(req, res) => {
						log4js.getLogger('default').info(`Redirecionando para ${path} (${origin})`);

						wsProxy.web(req, res,
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
					}
				);

				if (wsOn) {
					_server.on (
						'upgrade',
						(req, socket, head) => {
							log4js.getLogger('default').info(`Redirecionando (ws) para ${path} (${origin})`);

							wsProxy.ws(req, socket, head,
								{
									target: origin,
									cookiePathRewrite: false,
									changeOrigin: true
								}
							);
						}
					);
				}
			}
		);

		// Rotas -------------------------------------------------
		app.get (
			'/',
			(req, res) => {
				res.status(200).send(`Servidor de proxy está rodando em ${pServerCheck.protocolInfo}${listenOptions.host}:${listenOptions.port}...`);
			}
		);

		app.all (
			'*',
			(req, res) => {
				res.status(404).send('Essa rota não existe no servidor de proxy');
			}
		);

		// Handler erros proxy -----------------------------------
		wsProxy.on('error', (err, req, res) => {
			log4js.getLogger('default').error(err.stack || err);
		});
		// -------------------------------------------------------

		// Inicia servidor de proxy ------------------------------
		_server.listen(listenOptions, () => {
			try {
				log4js.getLogger('default').info(`Servidor de proxy está rodando em ${pServerCheck.protocolInfo}${listenOptions.host}:${listenOptions.port}...`);
				resolve();
			} catch (err) {
				reject(err);
			}
		}).on('error', err => {
			log4js.getLogger('default').error(err.stack || err);
		});
	});
};
// -------------------------------------------------------------------------

startProxy()
.catch (
	err => {
		console.error(err.stack || err);
	}
);
