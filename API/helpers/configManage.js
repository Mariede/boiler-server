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
		throw new Error(err);
	}
};

// Checa arquivo de configuracao por mudancas
const check = config => {
	return new Promise((resolve, reject) => {
		try {
			const readConfig = param => {
				return new Promise((resolve, reject) => {
					try {
						const isValidJson = json => {
							try {
								JSON.parse(json);
								return true;
							} catch(err) {
								log.logger('warn', 'Validação do conteúdo Json: ' + (err.message || err.stack || err), 'consoleOnly');
								return false;
							}
						};

						fs.readFile(param, 'utf8', (err, data) => {
							if (err) {
								reject(err);
							} else {
								resolve(isValidJson(data) ? JSON.parse(data) : {});
							}
						});
					} catch(err) {
						reject(err);
					}
				});
			};

			const deepIsEqual = (first, second) => {
				try {
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
				} catch(err) {
					throw new Error(err);
				}
			};

			// mostra mensagem mantendo um debounce de wait
			const showMessage = (func, wait) => {
				return new Promise((resolve, reject) => {
					try {
						clearTimeout(timeout);
						timeout = setTimeout(() => {
							resolve(func());
						}, wait);
					} catch(err) {
						reject(err);
					}
				});
			};

			const message = config => {
				try {
					log.logger('info', 'Arquivo ' + config + ' foi modificado... Favor corrigir ou reiniciar o servidor!!', 'consoleOnly');
				} catch(err) {
					throw new Error(err);
				}
			};

			let timeout = null;

			const watch = fs.watch(config, async (event, filename) => {
				try {
					if (event === 'change') {
						let objCheckIsEqual = true;

						do {
							objCheckIsEqual = deepIsEqual(__serverConfig, await readConfig(config));

							if (!objCheckIsEqual) {
								if (!timeout) {
									message(filename);
								}

								await showMessage(message.bind(this, filename), 5000);
							} else {
								if (timeout) {
									clearTimeout(timeout);
									timeout = null;
								}
							}
						} while (!objCheckIsEqual);
					}
				} catch(err) {
					throw new Error(err);
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
