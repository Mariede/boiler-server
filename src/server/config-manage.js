'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const fs = require('fs');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const functions = require('@serverRoot/helpers/functions');
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Checa arquivo de configuracao por mudancas
const check = config => {
	const readConfig = (param, fn, wait) => {
		return new Promise((resolve, reject) => {
			const isValidJson = json => {
				try {
					JSON.parse(json);
					return true;
				} catch (err) {
					log.logger('warn', `Validação de conteúdo para o arquivo ${fn}: ${(err.message || err.stack || err)}`, 'configFile');
					return false;
				}
			};

			// Le e valida se json permanece valido, com debounce de wait
			clearTimeout(timeoutReadFile);

			timeoutReadFile = setTimeout(() => {
				try {
					functions.readFile (
						fs,
						param,
						data => {
							try {
								resolve(isValidJson(data) ? JSON.parse(data) : {});
							} catch (err) {
								reject(err);
							}
						}
					);
				} catch (err) {
					reject(err);
				}
			}, wait);
		});
	};

	const jsonIsEqual = (first, second) => {
		let fRet = false;

		if (JSON.stringify(first) === JSON.stringify(second)) {
			fRet = true;
		}

		return fRet;
	};

	// Mostra mensagem mantendo um debounce de wait
	const showMessage = (fn, wait) => {
		return new Promise((resolve, reject) => {
			clearTimeout(timeoutMessages);
			timeoutMessages = setTimeout(() => {
				try {
					resolve(fn());
				} catch (err) {
					reject(err);
				}
			}, wait);
		});
	};

	const message = filename => {
		log.logger('info', `Arquivo ${filename} foi modificado... Favor corrigir ou reiniciar o servidor!!`, 'configFile');
	};

	const waitMessages = 5000;
	const waitReadFile = 500;

	let timeoutMessages = null,
		timeoutReadFile = null,
		objCheckIsEqual = false;

	const watch = fs.watch(config, async (event, filename) => {
		try {
			if (event === 'change') {
				do {
					objCheckIsEqual = jsonIsEqual(__serverConfig, await readConfig(config, filename, waitReadFile));

					if (!objCheckIsEqual) {
						if (!timeoutMessages) {
							message(filename);
						}

						await showMessage(message.bind(this, filename), waitMessages);
					} else {
						if (timeoutMessages) {
							clearTimeout(timeoutMessages);
							timeoutMessages = null;
						}
					}
				} while (!objCheckIsEqual);

				log.logger('info', `Arquivo ${filename} verificado`, 'configFile');
			}
		} catch (err) {
			log.logger('error', `Falha ao observar o arquivo ${filename}: ${(err.stack || err)}`, 'configFile');
		}
	});

	return watch;
};
// -------------------------------------------------------------------------

module.exports = {
	check
};
