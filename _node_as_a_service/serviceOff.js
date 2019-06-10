'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const service = require('node-windows').Service;
const config = require('./config');
// -------------------------------------------------------------------------

// Destruindo um objeto do Serviço existente
const svc = new service(
	{
		name: config.name,
		script: config.script
	}
);

svc.on(
	'uninstall',
	() => {
		console.log('Uninstall complete.');
		console.log('The service exists: ', svc.exists);
	}
);

// Desinstalando o serviço
svc.uninstall();
