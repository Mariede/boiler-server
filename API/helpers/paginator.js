'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Ordena massa de dados: sortElements Array e case sensitive, sortOrder Array opcional ASC/DESC (default: ASC)
const setSorter = (jsonData, sortElements = [], sortOrder = []) => {
	return new Promise((resolve, reject) => {
		try {
			let newData = [];

			if (jsonData && Array.isArray(jsonData)) {
				const sortFunction = (a, b, i, iLen) => {
					if (i < iLen) {
						let aCheck = (a[sortElements[i]] || ''),
							bCheck = (b[sortElements[i]] || ''),
							order = ((sortOrder[i] || '').toUpperCase() === 'DESC' ? { d1: 1, a1: -1 } : { d1: -1, a1: 1 });

						return ((aCheck < bCheck) ? order.d1 : ((aCheck > bCheck) ? order.a1 : sortFunction(a, b, ++i, iLen)));
					} else {
						return 0;
					}
				};

				newData = Array.from(jsonData);

				let sortElementsLen = (Array.isArray(sortElements) ? sortElements.length : 0);

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
			let backPage = currentPage - 1,
				pageDetails = {
					currentPage: currentPage,
					itemsPerPage: itemsPerPage,
					itemsFrom: (backPage * itemsPerPage) + 1,
					itemsTo: (currentPage * itemsPerPage < jsonDataLen ? currentPage * itemsPerPage : jsonDataLen),
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
