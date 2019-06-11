'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const dbCon = require('@serverRoot/helpers/db');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Queries dinamicas: searchFields Array, targetReplace e o identificador em baseQuery para montagem da query final (metodo privado)
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
					(e, i) => {
						searchQuery.dados.input[i] = [e, '%' + searchValue + '%'];

						if (queryWhere !== -1 || i !== 0) {
							if (i !== 0) {
								queryReplace += ' OR ';
							} else {
								queryReplace += ' AND (';
							}
						} else {
							queryReplace += ' WHERE (';
						}

						queryReplace += `CAST(${e} AS varchar(max)) LIKE(@${e})`;
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
		const falsyCheck = param => {
			try {
				const falsy = [null, undefined, NaN]; // except 0 and false and ""

				return (falsy.includes(param) ? '' : ((param === 0 || param === false) ? param.toString() : (param || '').toString()));
			} catch(err) {
				throw err;
			}
		};

		let method = req.method,
			searchFields = [],
			searchValue = '',
			e = new Error();

		e.name = 'BADR';

		if (method.toUpperCase() === 'GET') {
			if (req.query.fullsearch_fields) {
				req.query.fullsearch_fields.split(/[, |]/).forEach(
					e => {
						searchFields.push(e.toUpperCase());
					}
				);
			}

			if (Array.isArray(searchFields) && searchFields.length > 0) {
				searchValue += falsyCheck(req.query.fullsearch_value);
			}
		} else {
			e.message = 'Searcher: Favor utilizar verbo GET para realizar a consulta...';
			throw e;
		}

		return await _executeSearch(baseQuery, targetReplace, searchFields, searchValue);
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	setSearch
};
