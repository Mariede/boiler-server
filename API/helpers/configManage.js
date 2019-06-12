'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const fs = require('fs');
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Carrega arquivo de configuracao (sincrono)
const push = config => {
	try {
		return Object.freeze(JSON.parse(fs.readFileSync(config, 'utf8')));
	} catch(err) {
		throw err;
	}
};

// Checa arquivo de configuracao por mudancas
const check = config => {
	return new Promise((resolve, reject) => {
		try {
			const readConfig = (param, fn,  wait) => {
				return new Promise((resolve, reject) => {
					try {
						const isValidJson = json => {
							return new Promise(resolve => {
								try {
									JSON.parse(json);
									resolve(true);
								} catch(err) {
									log.logger('warn', `Validação de conteúdo para o arquivo ${fn}: ${(err.message || err.stack || err)}`, 'consoleOnly');
									resolve(false);
								}
							});
						};

						// le e valida se json permanece valido, com debounce de wait
						clearTimeout(timeoutReadFile);
						timeoutReadFile = setTimeout(() => {
							try {
								fs.readFile(param, 'utf8',
									(err, data) => {
										if (err) {
											reject(err);
										} else {
											isValidJson(data)
											.then(
												result => {
													resolve(result ? JSON.parse(data) : {});
												}
											)
											.catch(
												err => {
													reject(err);
												}
											);
										}
									}
								);
							} catch(err) {
								reject(err);
							}
						}, wait);
					} catch(err) {
						reject(err);
					}
				});
			};

			const deepIsEqual = (first, second) => {
				if (first === second) {
					return true;
				}

				// Try a quick compare by seeing if the length of properties are the same
				let firstProps = Object.getOwnPropertyNames(first),
					secondProps = Object.getOwnPropertyNames(second);

				// Check different amount of properties
				if (firstProps.length !== secondProps.length) {
					return false;
				}

				// Go through properties of first object
				for (let i = 0; i < firstProps.length; i++) {
					let prop = firstProps[i];

					// Check the type of property to perform different comparisons
					switch (typeof(first[prop])) {
					// If it is an object, decend for deep compare
						case 'object': {
							if (!deepIsEqual(first[prop], second[prop])) {
								return false;
							}
							break;
						}
						case 'number': {
						// with JavaScript NaN != NaN so we need a special check
							if (!isNaN(first[prop]) || !isNaN(second[prop])) {
								if (first[prop] !== second[prop]) {
									return false;
								}
							}
							break;
						}
						default: {
							if (first[prop] !== second[prop]) {
								return false;
							}
						}
					}
				}

				return true;
			};

			// mostra mensagem mantendo um debounce de wait
			const showMessage = (func, wait) => {
				return new Promise((resolve, reject) => {
					try {
						clearTimeout(timeoutMessages);
						timeoutMessages = setTimeout(() => {
							resolve(func());
						}, wait);
					} catch(err) {
						reject(err);
					}
				});
			};

			const message = fn => {
				log.logger('info', `Arquivo ${fn} foi modificado... Favor corrigir ou reiniciar o servidor!!`, 'consoleOnly');
			};

			let timeoutMessages = null,
				waitMessages = 5000,
				timeoutReadFile = null,
				waitReadFile = 500;

			const watch = fs.watch(config, async (event, filename) => {
				try {
					if (event === 'change') {
						let objCheckIsEqual = true;

						do {
							objCheckIsEqual = deepIsEqual(__serverConfig, await readConfig(config, filename, waitReadFile));

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

						log.logger('info', `Arquivo ${filename} verificado`, 'consoleOnly');
					}
				} catch(err) {
					throw err;
				}
			});

			resolve(watch);
		} catch(err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	push,
	check
};
