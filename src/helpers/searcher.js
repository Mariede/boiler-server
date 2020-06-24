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
		searchFields.forEach(
			e => {
				const transformP = p => {
					const changedP = p.replace(
						/([A-Z])/g,
						g => {
							return `_${g[0]}`;
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
const _executeSearch = (baseQuery, targetReplace, _searchFields, searchValue) => {
	return new Promise((resolve, reject) => {
		const searchFields = [..._camelCaseToSnakeCase(_searchFields)];
		const queryWhere = baseQuery.search(/[ \t\n]{1}where[ \t\n]{1}/i);

		const searchQuery = {
			formato: 1,
			dados: {
				input: []
			}
		};

		let queryReplace = '';

		if (searchFields.length > 0 && searchValue) {
			searchFields.forEach(
				(e, i) => {
					const regExp = new RegExp(`^\\s*select\\s+[\\s\\S]*?(\\w+\\.)(${e})\\s+`, 'i');
					const searchAlias = regExp.exec(baseQuery);
					const alias = (Array.isArray(searchAlias) ? (searchAlias[1] || '') : '');

					searchQuery.dados.input[i] = [e, 'varchar', `%${searchValue}%`];

					if (queryWhere !== -1 || i !== 0) {
						if (i !== 0) {
							queryReplace += ' OR ';
						} else {
							queryReplace += ' AND (';
						}
					} else {
						queryReplace += ' WHERE (';
					}

					queryReplace += `CAST(${alias + e} AS varchar(max)) LIKE(@${e})`;
				}
			);

			queryReplace += ')';
		}

		searchQuery.dados.executar = baseQuery.replace(new RegExp(targetReplace, 'g'), queryReplace);

		dbCon.msSqlServer.sqlExecuteAll(searchQuery)
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
	});
};

/*
Chamada inicial, verifica os dados de entrada do cliente, executa a acao

	=> setSearch so funciona com MS SQL Server
	=> Algoritmo sempre espera que as colunas no banco de dados estejam em SNAKE_CASE
	=> fullsearch_fields e fullsearch_value: parametros querystring esperados
*/
const setSearch = async (req, baseQuery, targetReplace) => {
	const searchFields = [];
	const searchValue = (req.query.fullsearch_value || '');

	if (req.query.fullsearch_fields) {
		req.query.fullsearch_fields.split(/[,|]/).forEach(
			e => {
				searchFields.push(String(e || '').trim());
			}
		);
	}

	if (req.method.toUpperCase() !== 'GET') {
		errWrapper.throwThis('SEARCHER', 400, 'Favor utilizar verbo GET para realizar a consulta...');
	}

	return await _executeSearch(baseQuery, targetReplace, searchFields, searchValue);
};
// -------------------------------------------------------------------------

module.exports = {
	setSearch
};
