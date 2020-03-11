'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const parseArgs = require('minimist');
const service = require('node-windows').Service;
const config = require('./config');

const sOn = 'on';
const sOff = 'off';
// -------------------------------------------------------------------------

const _servicoOnOff = param => {
	let dataService = {};

	if (config.name) {
		dataService.name = config.name;
	}

	if (config.description) {
		dataService.description = config.description;
	}

	if (config.script) {
		dataService.script = config.script;
	}

	if (config.env) {
		dataService.env = config.env;
	}

	const svc = new service(
		dataService
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

	svc.on(
		'uninstall',
		() => {
			console.log('Uninstall complete.');
			console.log(`${svc.exists ? 'Service still seems to exist... check it manually.' : 'Service does not exist.'}`);
		}
	);

	switch (param) {
		case sOn: {
			// instalando o servico
			svc.install();
			break;
		}
		case sOff: {
			// Desinstalando o serviço
			svc.uninstall();
			break;
		}
		default: {
			console.log('Argumento inválido ou não definido para função _servicoOnOff...');
		}
	}
};

const executeAction = () => {
	let args = parseArgs(process.argv),
		lenArgs = (typeof args === 'object' ? Object.keys(args).length : 0),
		errMsg = 'Utilize um dos argumentos:\n   --on  : para criar um serviço Windows associado ao projeto Node (base no arquivo config)\n   --off : para destruir um serviço Windows associado ao projeto Node (base no arquivo config)\n\nExemplo: node _nodeAsAService --on\n';

	if (lenArgs === 2) {
		if (args.on || args.off) {
			if (args.on) {
				_servicoOnOff(sOn);
			} else {
				_servicoOnOff(sOff);
			}
		} else {
			console.log(errMsg);
		}
	} else {
		console.log(errMsg);
	}
};

executeAction();
