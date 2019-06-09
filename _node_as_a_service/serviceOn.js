'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const service = require('node-windows').Service;
const config = require('./config');
// -------------------------------------------------------------------------

// Criando um novo objeto do Serviço
const svc = new service(
	{
		name: config.name,
		description: config.description,
		script: config.script,
		env: config.env
	}
);

svc.on(
	'install',
	() => {
		svc.start();
		console.log('Install complete.');
	}
);

svc.on(
	'alreadyinstalled',
	() => {
		console.log('Already Installed.');
	}
);

svc.on(
	'start',
	() => {
	console.log(`${svc.name} started!`);
});

// instalando o servico
svc.install();
