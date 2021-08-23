'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const xml2js = require('xml2js');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const errWrapper = require('@serverRoot/helpers/err-wrapper');
const functions = require('@serverRoot/helpers/functions');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------

/*
Utilizado na preparacao para o JSON final de retorno
	-> Adiciona chaves ao JSON de uma consulta, baseado em outras consultas
*/
const addKeysToRecords = (jsonData, arrKeysToAdd) => {
	if (Array.isArray(jsonData) && Array.isArray(arrKeysToAdd)) {
		return (
			jsonData.map(
				newRecord => {
					arrKeysToAdd.forEach(
						newKey => {
							newRecord[newKey.key] = newKey.content;
						}
					);

					return (
						newRecord
					);
				}
			)
		);
	}

	return jsonData;
};

/*
Converte chaves de uma array com objetos de SNAKE_CASE para camelCase
	-> Realiza conversao nas subchaves aninhadas dos objetos (nested keys)

	-> Remove chaves null do JSON

	-> Formata resultados tabulares especificos para novas subchaves aninhadas
		-> Regra: utilizar . no nome da chave para identificar niveis das subchaves do objeto
			-> ex: 'USUARIO.EMPRESA.ID'

	-> Se existir keysXmlToJson no formato array de objetos, converte dados XML relacionados para JSON
			-> [{ xmlRoot: 'ROOT1', xmlPath: 'PATH1' }, { xmlRoot: 'ROOT2', xmlPath: 'PATH2' }, ...]
			** xmlRoot deve ter o mesmo identificador da coluna no recordset **
*/
const keysToCamelCase = (jsonData, keysXmlToJson) => {
	const convertKeys = (cKey, cValue, nDocument) => {
		const transformP = p => {
			const changedP = String(p || '').toLowerCase().replace(
				/[_]([a-z])/g,
				g => {
					return g[1].toUpperCase();
				}
			);

			return changedP;
		};

		const nKey = transformP(cKey);

		if (Array.isArray(cValue)) {
			nDocument[nKey] = [];
			loopKeys(cValue, nDocument[nKey]);
		} else {
			if (typeof cValue === 'object' && cValue !== null) {
				if (!Object.prototype.hasOwnProperty.call(nDocument, nKey)) {
					if (cValue instanceof Date) {
						nDocument[nKey] = functions.formatDateToString(cValue);
					} else {
						nDocument[nKey] = {};
					}
				}

				loopKeys(cValue, nDocument[nKey]);
			}
		}

		return nKey;
	};

	const loopKeys = (cDocument, nDocument) => {
		Object.keys(cDocument).forEach(
			currentKey => {
				const currentValue = cDocument[currentKey];

				const deepValueCheck = currentKey.split('.').filter(
					item => {
						return item !== '';
					}
				);

				const resultValue = (
					deepValueCheck.reduceRight(
						(acc, key) => {
							return {
								[key]: acc
							};
						},
						currentValue
					)
				)[deepValueCheck[0]] || currentValue;

				const newKey = convertKeys(
					deepValueCheck[0],
					resultValue,
					nDocument
				);

				// Adicionar resultValue === null ||, para incluir valores nulos no JSON final
				if (typeof resultValue !== 'object') {
					nDocument[newKey] = resultValue;
				}
			}
		);
	};

	const loopArray = jData => {
		if (Array.isArray(jData)) {
			for (let i = 0; i < jData.length; i++) {
				const currentDocument = jData[i];

				if (typeof currentDocument === 'object' && currentDocument !== null) {
					newData.push({});
					loopKeys(currentDocument, newData[i]);
				}
			}
		}
	};

	// Conversao de XML para JSON, se for o caso
	const validateXmlToJson = () => {
		const checkData = Array.from(jsonData);

		if (Array.isArray(keysXmlToJson) && keysXmlToJson.length !== 0) {
			const parseBooleans = _input => {
				const parseResult = (/^(?:true|false)$/i.test(_input)) ? (
					_input.toLowerCase() === 'true'
				) : (
					_input
				);

				return parseResult;
			};

			const parseNumbers = _input => {
				const parseResult = (!isNaN(_input) && !isNaN(parseFloat(_input))) ? (
					Number(_input)
				) : (
					_input
				);

				return parseResult;
			};

			checkData.map(
				record => {
					return (
						keysXmlToJson.forEach(
							arrKey => {
								xml2js.parseString(
									record[arrKey.xmlRoot],
									{
										explicitRoot: false,
										explicitArray: false,
										valueProcessors: [
											parseBooleans,
											parseNumbers
										]
									},
									(err, result) => {
										if (!err) {
											record[arrKey.xmlRoot] = (result[arrKey.xmlPath] || result);
										}

										return record;
									}
								);
							}
						)
					);
				}
			);
		}

		return checkData;
	};

	const validatedData = validateXmlToJson();

	const newData = [];

	if (validatedData) {
		loopArray(validatedData);
	}

	return newData;
};

/*
Chamada inicial, verifica os dados de entrada do cliente, executa a acao (ordenador)

	Ordenador: sortElements deve ser uma array e case sensitive para as chaves
		-> sortOrder Array ASC/DESC (default: ASC)
		-> sortCaseInsensitive true/false

	toCamelCase: Boolean ou Array de objetos caso true mais propriedades em xml para conversao json
*/
const setSort = (req, jsonData, toCamelCase = false) => {
	const _executeSort = (sortElements, sortOrder, sortCaseInsensitive) => {
		const sortThis = (a, b, i, iLen) => {
			const getNestedValue = (obj, currentKey) => {
				return currentKey.split('.').reduce(
					(o, k) => {
						if (!Object.prototype.hasOwnProperty.call(o, k)) {
							if (typeof o === 'object') {
								return undefined;
							}

							return o;
						}

						return o[k];
					},
					obj
				);
			};

			if (i < iLen) {
				const order = ((sortOrder[i] || '').toUpperCase() === 'DESC' ? { d1: 1, a1: -1 } : { d1: -1, a1: 1 });
				const aCheck = functions.formatStringToDate(getNestedValue(a, sortElements[i]) || '');
				const bCheck = functions.formatStringToDate(getNestedValue(b, sortElements[i]) || '');

				const checkData = (
					typeof aCheck === 'string' && typeof bCheck === 'string' ? (
						collator.compare(aCheck, bCheck)
					) : (
						aCheck - bCheck
					)
				);

				return ((checkData < 0) ? order.d1 : ((checkData > 0) ? order.a1 : sortThis(a, b, i + 1, iLen)));
			}

			return 0;
		};

		const newData = (toCamelCase ? keysToCamelCase(jsonData, toCamelCase) : Array.from(jsonData));
		const sortElementsLen = (Array.isArray(sortElements) ? sortElements.length : 0);
		const collator = new Intl.Collator(
			undefined, // Default locale
			{
				ignorePunctuation: false,
				localeMatcher: 'best fit',
				numeric: true,
				sensitivity: (sortCaseInsensitive ? 'base' : 'case'),
				usage: 'sort'
			}
		);

		newData.sort(
			(a, b) => {
				return sortThis(a, b, 0, sortElementsLen);
			}
		);

		return newData;
	};

	const sortElements = [];
	const sortOrder = [];
	const sortCaseInsensitive = /^(true|yes|y|sim|s){0,1}$/i.test(req.query.sort_case_insensitive);

	if (req.query.sort_fields) {
		req.query.sort_fields.split(/[,|]/).forEach(
			e => {
				const sortField = e.split(/[:]/);

				if (sortField[0]) {
					sortElements.push(String(sortField[0] || '').trim());
					sortOrder.push(String(sortField[1] || '').trim());
				}
			}
		);
	}

	if (req.method.toUpperCase() !== 'GET') {
		errWrapper.throwThis('ORDENAÇÃO (SORTER)', 400, 'Favor utilizar verbo GET para realizar a ordenação...');
	}

	return _executeSort(sortElements, sortOrder, sortCaseInsensitive);
};

/*
Chamada inicial, verifica os dados de entrada do cliente, executa a acao (paginador)
	-> page na querystring e obrigatorio para a paginacao

	Paginador: currentPage / itemsPerPage
		-> retorna pageDetails, recordset, rowsAffected, output, returnValue

	toCamelCase: Boolean ou Array de objetos caso true mais propriedades em xml para conversao json
*/
const setPage = (req, jsonDataAll, jsonData, jsonDataLen, toCamelCase = false) => {
	const _executePage = (currentPage, itemsPerPage, output, returnValue) => {
		const backPage = currentPage - 1;
		const _iFrom = (backPage * itemsPerPage) + 1;
		const _iTo = currentPage * itemsPerPage;
		const pageDetails = {
			currentPage: currentPage,
			itemsPerPage: itemsPerPage,
			itemsFrom: (_iFrom <= jsonDataLen ? (_iTo !== 0 ? _iFrom : 0) : 0),
			itemsTo: (_iFrom <= jsonDataLen ? (_iTo <= jsonDataLen ? _iTo : jsonDataLen) : 0),
			itemsCount: jsonDataLen,
			totalPages: Math.ceil(jsonDataLen / itemsPerPage)
		};
		const indexSearchStart = backPage * itemsPerPage;
		const indexSearchStop = indexSearchStart + itemsPerPage;
		const recordSet = (toCamelCase ? keysToCamelCase(jsonData, toCamelCase) : Array.from(jsonData)).filter(
			(e, i) => {
				return (i >= indexSearchStart && i < indexSearchStop);
			}
		);
		const rowsAffected = recordSet.length;
		const result = { pageDetails: pageDetails, recordset: recordSet, rowsAffected: rowsAffected };

		if (typeof output === 'object' && Object.keys(output).length) {
			result.output = output;
		}

		if (returnValue) {
			result.returnValue = returnValue;
		}

		return result;
	};

	let currentPage = 0,
		itemsPerPage = 10;

	if (/^(\d)+$/.test(req.query.page)) {
		currentPage = parseInt(req.query.page, 10);
	}

	if (/^(\d)+$/.test(req.query.items_per_page)) {
		itemsPerPage = parseInt(req.query.items_per_page, 10);
	}

	if (req.method.toUpperCase() !== 'GET') {
		errWrapper.throwThis('PAGINAÇÃO (PAGINATOR)', 400, 'Favor utilizar verbo GET para realizar a consulta...');
	}

	return _executePage(currentPage, itemsPerPage, jsonDataAll.output, jsonDataAll.returnValue);
};

/*
Formata a saida para o cliente selecionando o recordset de retorno, casos existam recordsets

	toCamelCase: Boolean ou Array de objetos caso true mais propriedades em xml para conversao json
*/
const setResult = (jsonDataAll, jsonData, jsonDataLen, toCamelCase = false) => {
	const formattedResult = {};

	formattedResult.recordset = (toCamelCase ? keysToCamelCase(jsonData, toCamelCase) : Array.from(jsonData));
	formattedResult.rowsAffected = jsonDataLen;

	if (typeof jsonDataAll.output === 'object' && Object.keys(jsonDataAll.output).length) {
		formattedResult.output = jsonDataAll.output;
	}

	if (jsonDataAll.returnValue) {
		formattedResult.returnValue = jsonDataAll.returnValue;
	}

	return formattedResult;
};
// -------------------------------------------------------------------------

module.exports = {
	addKeysToRecords,
	keysToCamelCase,
	setSort,
	setPage,
	setResult
};
