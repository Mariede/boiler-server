'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const fs = require('fs');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Checa arquivo de configuracao por mudancas
const check = config => {
	return new Promise((resolve, reject) => {
		try {
			const readConfig = (param, fn, wait) => {
				return new Promise((resolve, reject) => {
					try {
						const isValidJson = json => {
							return new Promise(resolve => {
								try {
									JSON.parse(json);
									resolve(true);
								} catch (err) {
									log.logger('warn', `Validação de conteúdo para o arquivo ${fn}: ${(err.message || err.stack || err)}`, 'configFile');
									resolve(false);
								}
							});
						};

						// Le e valida se json permanece valido, com debounce de wait
						clearTimeout(timeoutReadFile);

						timeoutReadFile = setTimeout(() => {
							try {
								fs.readFile (
									param,
									'utf8',
									(err, data) => {
										if (err) {
											reject(err);
										} else {
											isValidJson(data)
											.then (
												result => {
													resolve(result ? JSON.parse(data) : {});
												}
											)
											.catch (
												err => {
													reject(err);
												}
											);
										}
									}
								);
							} catch (err) {
								reject(err);
							}
						}, wait);
					} catch (err) {
						reject(err);
					}
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
			const showMessage = (func, wait) => {
				return new Promise((resolve, reject) => {
					try {
						clearTimeout(timeoutMessages);
						timeoutMessages = setTimeout(() => {
							resolve(func());
						}, wait);
					} catch (err) {
						reject(err);
					}
				});
			};

			const message = fn => {
				log.logger('info', `Arquivo ${fn} foi modificado... Favor corrigir ou reiniciar o servidor!!`, 'configFile');
			};

			let timeoutMessages = null,
				waitMessages = 5000,
				timeoutReadFile = null,
				waitReadFile = 500,
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
					throw err;
				}
			});

			resolve(watch);
		} catch (err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	check
};
