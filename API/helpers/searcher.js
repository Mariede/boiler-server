'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const dbCon = require('@serverRoot/helpers/db');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Devolve um dados para analise (metodo privado)
const _falsyCheck = param => {
	try {
		const falsy = [null, undefined, NaN]; // except 0 and false and ""

		return (falsy.includes(param) ? '' : ((param === 0 || param === false) ? param.toString() : (param || '').toString()));
	} catch(err) {
		throw new Error(err);
	}
};

// Queries dinamicas: searchFields Array, targetReplace e o identificador em baseQuery para montagem da query final
const searchExecute = (baseQuery, targetReplace, searchFields, searchValue) => {
	return new Promise((resolve, reject) => {
		try {
			let queryWhere = baseQuery.search(/ where /i),
				queryReplace = '',
				value = _falsyCheck(searchValue),
				searchQuery = {
					formato: 1,
					dados: {
						input: [],
					}
				};

			if (searchFields && Array.isArray(searchFields)) {
				searchFields.forEach(
					(field, index) => {
						searchQuery.dados.input[index] = [field, '%' + value + '%'];

						if (queryWhere !== -1 || index !== 0) {
							if (index !== 0) {
								queryReplace += ' OR ';
							} else {
								queryReplace += ' AND (';
							}
						} else {
							queryReplace += ' WHERE (';
						}

						queryReplace += `CAST(${field} AS varchar(max)) LIKE(@${field})`;
					}
				);

				searchQuery.dados.executar = baseQuery.replace(targetReplace, queryReplace + ')');
			}

			dbCon.sqlExecuteAll(searchQuery)
			.then(
				result => {
					resolve(result);
				}
			)
			.catch(
				err => {
					reject(err);
				}
			);
		} catch(err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	searchExecute
};
