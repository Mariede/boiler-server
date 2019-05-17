'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Ordena massa de dados
const setSorter = (jsonData, sortElements, order = 'ASC') => { // sortElements Array e case sensitive
	return new Promise((resolve, reject) => {
		try {
			let newData = [];

			if (jsonData && Array.isArray(jsonData)) {
				const sortFunction = (a, b, i, iLen) => {
					if (i < iLen) {
						let aCheck = (a[sortElements[i]] || ''),
							bCheck = (b[sortElements[i]] || '');

						return ((aCheck < bCheck) ? sortOrder.d1 : ((aCheck > bCheck) ? sortOrder.a1 : sortFunction(a, b, ++i, iLen)));
					} else {
						return 0;
					}
				};

				newData = Array.from(jsonData);

				let sortOrder = (order.toUpperCase() === 'DESC' ? { d1: 1, a1: -1 } : { d1: -1, a1: 1 }),
					sortElementsLen = (Array.isArray(sortElements) ? sortElements.length : 0);

				newData.sort(
					(a, b) => {
						return sortFunction(a, b, 0, sortElementsLen);
					}
				);
			}

			resolve(newData);
		} catch(err) {
			reject(err);
		}
	});
};

// Retorna pagina especifica da massa de dados e detalhes da paginacao
const setPage = (jsonData, jsonDataLen, currentPage = 1, itemsPerPage = 10) => {
	return new Promise((resolve, reject) => {
		try {
			let pageDetails = {
					currentPage: currentPage,
					itemsPerPage: itemsPerPage,
					totalItems: jsonDataLen,
					totalPages: Math.ceil(jsonDataLen / itemsPerPage)
				},
				backPage = currentPage - 1,
				indexSearchStart = backPage * itemsPerPage,
				indexSearchStop = indexSearchStart + itemsPerPage,
				pageData = jsonData.filter(
					(e, i) => {
						return (i >= indexSearchStart && i < indexSearchStop);
					}
				),
				rowsAffected = pageData.length;

			resolve({ pageDetails: pageDetails, pageData: pageData, rowsAffected: rowsAffected });
		} catch(err) {
			reject(err);
		}
	});
};

// Converte resultado de uma array com objetos para Camel Case
const keysToCamelCase = jsonData => {
	return new Promise((resolve, reject) => {
		try {
			let newData = [];

			if (jsonData && Array.isArray(jsonData)) {
				for (let i = 0; i < jsonData.length; i++) {
					if (typeof jsonData[i] === 'object' && jsonData[i] !== null) {
						newData.push({});

						Object.keys(jsonData[i]).forEach(
							function(currentKey) {
								let newKey = currentKey
													.toLowerCase()
													.replace(/[._-]([a-z])/g,
														function(g) {
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
	setSorter,
	setPage,
	keysToCamelCase
};
