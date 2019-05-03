"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao
const fs = require('fs');
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Carrega config.json e checa por mudancas
const check = config => {
	return new Promise((resolve, reject) => {
		try {
			const readConfig = param => {
				return new Promise((resolve, reject) => {
					try {
						fs.readFile(param, 'utf8', function (err, data) {
							if (err) {
								reject(err);
							} else {
								resolve(data);
							}
						})
					} catch(err) {
						reject(err)
					}
				});
			};





			function deepIsEqual(first, second) {
			// If first and second are the same type and have the same value
			// Useful if strings or other primitive types are compared
			if( first === second ) return true;

			// Try a quick compare by seeing if the length of properties are the same
			let firstProps = Object.getOwnPropertyNames(first);
			let secondProps = Object.getOwnPropertyNames(second);

			// Check different amount of properties
			if( firstProps.length != secondProps.length ) return false;

			// Go through properties of first object
			for(var i=0; i<firstProps.length; i++) {
			let prop = firstProps[i];
			// Check the type of property to perform different comparisons
			switch( typeof( first[prop] ) ) {
			// If it is an object, decend for deep compare
			case 'object':
			if( !deepIsEqual(first[prop], second[prop]) ) return false;
			break;
			case 'number':
			// with JavaScript NaN != NaN so we need a special check
			if(isNaN(first[prop]) && isNaN(second[prop])) break;
			default:
			if( first[prop] != second[prop] ) return false;
			}
			}
			return true;
			};








			fs.watch(config, async function (event, filename) {
				if (event === 'change') {
					let fileContent = await readConfig(config),
						objCheck1 = JSON.parse(fileContent),
						objCheck2 = __serverConfig;

					if (!deepIsEqual(objCheck1, objCheck2)) {
						log.logger('info', 'Arquivo config.json foi modificado... Favor corrigir ou reiniciar o servidor!!', 'consoleOnly');
					}
				}
			});

			resolve();
		} catch(err) {
			reject(err);
		}
	});
};

module.exports = {
	check
};
