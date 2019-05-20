'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Ordenador (sort): sortElements deve ser uma array e case sensitive, sortOrder Array ASC/DESC (default: ASC)
const _executeSort = (jsonData, sortElements, sortOrder) => {
	return new Promise((resolve, reject) => {
		try {
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

// Paginador (page): pagina currentPage / itemsPerPage, retorno => pageDetails, itemsList, rowsAffected
const _executePage = (jsonData, jsonDataLen, currentPage, itemsPerPage) => {
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

// Chamada inicial, verifica os dados de entrada do cliente, executa a acao (ordenador)
const setSort = async (req, jsonData) => {
	try {
		let sortElements = ['SORTER2', 'SORTER1'], // temporario, vem por req
			sortOrder = ['DESC', 'ASC']; // temporario, vem por req

		return await _executeSort(jsonData, sortElements, sortOrder);
	} catch(err) {
		throw new Error(err);
	}
};

// Chamada inicial, verifica os dados de entrada do cliente, executa a acao (paginador)
const setPage = async (req, jsonData, jsonDataLen) => {
	try {
		let currentPage = 3, // temporario, vem por req
			itemsPerPage = 9; // temporario, vem por req

		return await _executePage(jsonData, jsonDataLen, currentPage, itemsPerPage);
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
