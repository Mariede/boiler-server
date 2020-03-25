'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const errWrapper = require('@serverRoot/helpers/errWrapper');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
/*
Ordenador (sort): sortElements deve ser uma array e case sensitive para as chaves (metodo privado)
	-> sortOrder Array ASC/DESC (default: ASC)
	-> sortCaseInsensitive true/false
*/
const _executeSort = (jsonData, sortElements, sortOrder, sortCaseInsensitive) => {
	return new Promise((resolve, reject) => {
		try {
			const sortThis = (a, b, i, iLen) => {
				if (i < iLen) {
					let aCheck = (a[sortElements[i]] || ''),
						bCheck = (b[sortElements[i]] || ''),
						order = ((sortOrder[i] || '').toUpperCase() === 'DESC' ? { d1: 1, a1: -1 } : { d1: -1, a1: 1 });

					if (sortCaseInsensitive) {
						if (typeof aCheck === 'string') {
							aCheck = aCheck.toLowerCase();
						}

						if (typeof bCheck === 'string') {
							bCheck = bCheck.toLowerCase();
						}
					}

					return ((aCheck < bCheck) ? order.d1 : ((aCheck > bCheck) ? order.a1 : sortThis(a, b, ++i, iLen)));
				} else {
					return 0;
				}
			};

			let newData = Array.from(jsonData),
				sortElementsLen = (Array.isArray(sortElements) ? sortElements.length : 0);

			newData.sort(
				(a, b) => {
					return sortThis(a, b, 0, sortElementsLen);
				}
			);

			resolve(newData);
		} catch(err) {
			reject(err);
		}
	});
};

// Paginador (page): pagina currentPage / itemsPerPage, retorno => pageDetails, recordset, output, rowsAffected (metodo privado)
const _executePage = (jsonData, jsonDataLen, currentPage, itemsPerPage, output = {}) => {
	return new Promise((resolve, reject) => {
		try {
			let backPage = currentPage - 1,
				_iFrom = (backPage * itemsPerPage) + 1,
				_iTo = currentPage * itemsPerPage,
				pageDetails = {
					currentPage: currentPage,
					itemsPerPage: itemsPerPage,
					itemsFrom: (_iFrom <= jsonDataLen ? (_iTo !== 0 ? _iFrom : 0) : 0),
					itemsTo: (_iFrom <= jsonDataLen ? (_iTo <= jsonDataLen ? _iTo : jsonDataLen) : 0),
					itemsCount: jsonDataLen,
					totalPages: Math.ceil(jsonDataLen / itemsPerPage)
				},
				indexSearchStart = backPage * itemsPerPage,
				indexSearchStop = indexSearchStart + itemsPerPage,
				recordSet = jsonData.filter(
					(e, i) => {
						return (i >= indexSearchStart && i < indexSearchStop);
					}
				),
				rowsAffected = [recordSet.length];

			resolve({ pageDetails: pageDetails, recordset: recordSet, output: output, rowsAffected: rowsAffected });
		} catch(err) {
			reject(err);
		}
	});
};

// Converte chaves de uma array com objetos de SNAKE_CASE para camelCase
const keysToCamelCase = jsonData => {
	return new Promise((resolve, reject) => {
		try {
			const convertKeys = (cKey, cValue, nDocument) => {
				const transformP = p => {
					const changedP = p.toLowerCase().replace(/[_]([a-z])/g,
						g => {
							return g[1].toUpperCase();
						}
					);

					return changedP;
				};

				let nKey = transformP(cKey);

				if (Array.isArray(cValue)) {
					nDocument[nKey] = [];
					loopKeys(cValue, nDocument[nKey]);
				} else {
					if (typeof cValue === 'object' && cValue !== null) {
						nDocument[nKey] = {};
						loopKeys(cValue, nDocument[nKey]);
					}
				}

				return nKey;
			};

			const loopKeys = (cDocument, nDocument) => {
				Object.keys(cDocument).forEach(
					currentKey => {
						let currentValue = cDocument[currentKey],
							newKey = convertKeys(currentKey, currentValue, nDocument);

						if (currentValue === null || typeof currentValue !== 'object') {
							nDocument[newKey] = currentValue;
						}
					}
				);
			};

			const loopArray = jData => {
				if (Array.isArray(jData)) {
					for (let i = 0; i < jData.length; i++) {
						let currentDocument = jData[i];

						if (typeof currentDocument === 'object' && currentDocument !== null) {
							newData.push({});
							loopKeys(currentDocument, newData[i]);
						}
					}
				}
			};

			let newData = [];

			if (jsonData) {
				loopArray(jsonData);
			}

			resolve(newData);
		} catch(err) {
			reject(err);
		}
	});
};

// Chamada inicial, verifica os dados de entrada do cliente, executa a acao (ordenador)
const setSort = async (req, jsonData, toCamelCase = false) => {
	try {
		let method = req.method,
			sortElements = [],
			sortOrder = [],
			sortCaseInsensitive = false;

		if (method.toUpperCase() === 'GET') {
			if (req.query.sort_fields) {
				req.query.sort_fields.split(/[,|]/).forEach(
					e => {
						let sortField = e.split(/[:]/);

						if (sortField[0]) {
							sortElements.push(sortField[0]);
							sortOrder.push((sortField[1] || ''));
						}
					}
				);

				sortCaseInsensitive = /^(true|yes|y|sim|s){0,1}$/i.test(req.query.sort_case_insensitive);
			}
		} else {
			errWrapper.throwThis('ORDENAÇÃO (SORTER)', 400, 'Favor utilizar verbo GET para realizar a ordenação...');
		}

		if (toCamelCase) {
			jsonData = await keysToCamelCase(jsonData);
		}

		return await _executeSort(jsonData, sortElements, sortOrder, sortCaseInsensitive);
	} catch(err) {
		throw err;
	}
};

/*
Chamada inicial, verifica os dados de entrada do cliente, executa a acao (paginador)
	-> page na querystring e obrigatorio para a paginacao
*/
const setPage = async (req, jsonData, jsonDataLen, toCamelCase = false) => {
	try {
		let method = req.method,
			currentPage = 0,
			itemsPerPage = 10;

		if (method.toUpperCase() === 'GET') {
			if (/^(\d)+$/.test(req.query.page)) {
				currentPage = parseInt(req.query.page, 10);
			}

			if (/^(\d)+$/.test(req.query.items_per_page)) {
				itemsPerPage = parseInt(req.query.items_per_page, 10);
			}
		} else {
			errWrapper.throwThis('PAGINAÇÃO (PAGINATOR)', 400, 'Favor utilizar verbo GET para realizar a consulta...');
		}

		if (toCamelCase && jsonData.recordset) {
			jsonData.recordset = await keysToCamelCase(jsonData.recordset);
		}

		if (currentPage && jsonData.recordset) {
			return await _executePage(jsonData.recordset, jsonDataLen, currentPage, itemsPerPage, jsonData.output);
		} else {
			return jsonData;
		}
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	keysToCamelCase,
	setSort,
	setPage
};
