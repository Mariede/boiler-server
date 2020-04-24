'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const dbCon = require('@serverRoot/helpers/db');
const errWrapper = require('@serverRoot/helpers/err-wrapper');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Converte searchFields de camelCase para SNAKE_CASE
const _camelCaseToSnakeCase = searchFields => {
	const newSearchFields = [];

	if (searchFields && Array.isArray(searchFields)) {
		searchFields.forEach (
			e => {
				const transformP = p => {
					const changedP = p.replace(/([A-Z])/g,
						g => {
							return '_' + g[0];
						}
					)
					.toUpperCase();

					return changedP;
				};

				const isUpperCase = _s => {
					const s = String(_s);
					return (s === s.toUpperCase());
				};

				const newField = ((/(_)+/.test(e) || isUpperCase(e)) ? e : transformP(e));

				newSearchFields.push(newField);
			}
		);
	}

	return newSearchFields;
};

/*
Queries dinamicas: searchFields Array, targetReplace e o identificador em baseQuery para montagem da query final (metodo privado)
	-> se WHERE for definido na query, deve conter uma condição ANTES do replace
*/
const _executeSearch = (baseQuery, targetReplace, searchFields, searchValue) => {
	return new Promise((resolve, reject) => {
		const queryWhere = baseQuery.search(/where[ \t\n]/i);

		const searchQuery = {
			formato: 1,
			dados: {
				input: []
			}
		};

		let queryReplace = '';

		if (searchFields.length > 0) {
			searchFields.forEach (
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

		dbCon.msSqlServer.sqlExecuteAll(searchQuery)
		.then (
			result => {
				resolve(result);
			}
		)
		.catch (
			err => {
				reject(err);
			}
		);
	});
};

// Chamada inicial, verifica os dados de entrada do cliente, executa a acao
const setSearch = async (req, baseQuery, targetReplace) => {
	const falsyCheck = param => {
		const falsy = [null, undefined, NaN]; // Excecao => 0 / false / ""
		return (falsy.includes(param) ? '' : ((param === 0 || param === false) ? param.toString() : (param || '').toString()));
	};

	const method = req.method;
	const searchFields = [];
	const _searchFields = [];

	let searchValue = '';

	if (method.toUpperCase() === 'GET') {
		if (req.query.fullsearch_fields) {
			req.query.fullsearch_fields.split(/[,|]/).forEach (
				e => {
					searchFields.push(e.trim());
				}
			);
		}

		if (Array.isArray(searchFields) && searchFields.length > 0) {
			searchValue += falsyCheck(req.query.fullsearch_value);
		}
	} else {
		errWrapper.throwThis('SEARCHER', 400, 'Favor utilizar verbo GET para realizar a consulta...');
	}

	_searchFields.push(..._camelCaseToSnakeCase(searchFields));

	return await _executeSearch(baseQuery, targetReplace, _searchFields, searchValue);
};
// -------------------------------------------------------------------------

module.exports = {
	setSearch
};
