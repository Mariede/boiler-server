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
/*
Chamada inicial, verifica os dados de entrada do cliente, executa a acao
	-> setSearch so funciona com MS SQL Server
	-> algoritmo sempre espera que as colunas no banco de dados estejam em SNAKE_CASE
	-> fullsearch_fields e fullsearch_value: parametros querystring esperados
		-> fullsearch_fields contem os nomes das colunas no DB, pode estar em camelCase - sempre converte para SNAKE_CASE

	Queries dinamicas: searchFields Array, targetReplace informa o identificador em baseQuery para montagem da query final
		-> searchFields deve conter identificadores unicos (ex. duas colunas NOME para pesquisa no SELECT pode causar erro)
		-> se WHERE for definido na baseQuery:
			* deve conter uma condição ANTES do replace
			* o conteudo da clausula where sempre sera um AND para o searcher

	Queries dinamicas: captura de alias para as colunas selecionadas no select da baseQuery (regExp):
		-> Alias nas subqueries devem ser avaliados com cuidado,
		-> ja que o alias sera capturado no primeiro encontro da coluna, caso exista
*/
const setSearch = async (req, baseQuery, targetReplace) => {
	const _executeSearch = (baseQuery, targetReplace, _searchFields, searchValue) => {
		return new Promise((resolve, reject) => {
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
			- Converte searchFields de camelCase para SNAKE_CASE
			- Retira eventuais valores vazios
			*/
			const searchFields = [..._camelCaseToSnakeCase(_searchFields)].filter(
				e => {
					return (e !== '');
				}
			);

			const regExpWhere = /\s+(FROM)\s+(?![\s\S]*?\1)[\s\S]*?\s+WHERE\s+/i;
			const queryWhere = baseQuery.search(regExpWhere);

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
						const regExpAlias = new RegExp(`SELECT\\s+[\\s\\S]*?(\\w+\\.)(${e})\\s+`, 'i');
						const searchAlias = regExpAlias.exec(baseQuery);
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

	const searchFields = [];
	const searchValue = String(req.query.fullsearch_value || '').trim();

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
