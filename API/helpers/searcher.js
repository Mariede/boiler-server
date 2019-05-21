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
const _executeSearch = (baseQuery, targetReplace, searchFields, searchValue) => {
	return new Promise((resolve, reject) => {
		try {
			let queryWhere = baseQuery.search(/where[ \t\n]/i),
				queryReplace = '',
				searchQuery = {
					formato: 1,
					dados: {
						input: []
					}
				};

			if (searchFields.length > 0) {
				searchFields.forEach(
					(field, index) => {
						searchQuery.dados.input[index] = [field, '%' + searchValue + '%'];

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

				queryReplace += ')';
			}

			searchQuery.dados.executar = baseQuery.replace(targetReplace, queryReplace);

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

// Chamada inicial, verifica os dados de entrada do cliente, executa a acao
const setSearch = async (req, baseQuery, targetReplace) => {
	try {
		let method = req.method,
			searchFields = [],
			searchValue = '';

		if (method === 'GET') {
			if (req.query.fullsearch_fields) {
				req.query.fullsearch_fields.split(/[, |]/).forEach(
					(e, i) => {
						searchFields.push(e.toUpperCase());
					}
				);
			}

			if (Array.isArray(searchFields) && searchFields.length > 0) {
				searchValue += _falsyCheck(req.query.fullsearch_value);
			}
		} else {
			throw new Error('Searcher: Favor utilizar verbo GET para realizar a consulta...');
		}

		return await _executeSearch(baseQuery, targetReplace, searchFields, searchValue);
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

module.exports = {
	setSearch
};
