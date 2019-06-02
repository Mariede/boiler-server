'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Ordenador (sort): sortElements deve ser uma array e case sensitive para as chaves (metodo privado)
// sortOrder Array ASC/DESC (default: ASC)
// sortCaseInsensitive true/false
const _executeSort = (jsonData, sortElements, sortOrder, sortCaseInsensitive) => {
	return new Promise((resolve, reject) => {
		try {
			const sortFunction = (a, b, i, iLen) => {
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

					return ((aCheck < bCheck) ? order.d1 : ((aCheck > bCheck) ? order.a1 : sortFunction(a, b, ++i, iLen)));
				} else {
					return 0;
				}
			};

			let newData = Array.from(jsonData),
				sortElementsLen = (Array.isArray(sortElements) ? sortElements.length : 0);

			newData.sort(
				(a, b) => {
					return sortFunction(a, b, 0, sortElementsLen);
				}
			);

			resolve(newData);
		} catch(err) {
			reject(err);
		}
	});
};

// Paginador (page): pagina currentPage / itemsPerPage, retorno => pageDetails, itemsList, rowsAffected (metodo privado)
const _executePage = (jsonData, jsonDataLen, currentPage, itemsPerPage) => {
	return new Promise((resolve, reject) => {
		try {
			let backPage = currentPage - 1,
				_iFrom = (backPage * itemsPerPage) + 1,
				_iTo = currentPage * itemsPerPage,
				pageDetails = {
					currentPage: currentPage,
					itemsPerPage: itemsPerPage,
					itemsFrom: (_iFrom < jsonDataLen ? _iFrom : jsonDataLen),
					itemsTo: (_iTo < jsonDataLen ? _iTo : jsonDataLen),
					itemsCount: jsonDataLen,
					totalPages: Math.ceil(jsonDataLen / itemsPerPage)
				},
				indexSearchStart = backPage * itemsPerPage,
				indexSearchStop = indexSearchStart + itemsPerPage,
				itemsList = jsonData.filter(
					(e, i) => {
						return (i >= indexSearchStart && i < indexSearchStop);
					}
				),
				rowsAffected = itemsList.length;

			resolve({ pageDetails: pageDetails, itemsList: itemsList, rowsAffected: rowsAffected });
		} catch(err) {
			reject(err);
		}
	});
};

// Chamada inicial, verifica os dados de entrada do cliente, executa a acao (ordenador)
const setSort = async (req, jsonData) => {
	try {
		let method = req.method,
			sortElements = [],
			sortOrder = [],
			sortCaseInsensitive = false;

		if (method.toUpperCase() === 'GET') {
			if (req.query.sort_fields) {
				req.query.sort_fields.split(/[, |]/).forEach(
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
			throw new Error('Ordenação (Sorter): Favor utilizar verbo GET para realizar a ordenação...');
		}

		return await _executeSort(jsonData, sortElements, sortOrder, sortCaseInsensitive);
	} catch(err) {
		throw new Error(err);
	}
};

// Chamada inicial, verifica os dados de entrada do cliente, executa a acao (paginador)
// page na querystring e obrigatorio para a paginacao
const setPage = async (req, jsonData, jsonDataLen) => {
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
			throw new Error('Paginação (Paginator): Favor utilizar verbo GET para realizar a consulta...');
		}

		if (currentPage) {
			return await _executePage(jsonData, jsonDataLen, currentPage, itemsPerPage);
		} else {
			return jsonData;
		}
	} catch(err) {
		throw new Error(err);
	}
};

// Converte chaves de uma array com objetos para Camel Case
const keysToCamelCase = jsonData => {
	return new Promise((resolve, reject) => {
		try {
			let newData = [];

			if (jsonData && Array.isArray(jsonData)) {
				for (let i = 0; i < jsonData.length; i++) {
					if (typeof jsonData[i] === 'object' && jsonData[i] !== null) {
						newData.push({});

						Object.keys(jsonData[i]).forEach(
							currentKey => {
								let newKey = currentKey
									.toLowerCase()
									.replace(/[._-]([a-z])/g,
										g => {
											return g[1].toUpperCase();
										}
									);

								newData[i][newKey] = jsonData[i][currentKey];
							}
						);
					}
				}
			}

			resolve(newData);
		} catch(err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	setSort,
	setPage,
	keysToCamelCase
};
