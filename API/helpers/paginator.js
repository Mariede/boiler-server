"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Ordena massa de dados
const setSorter = (jsonData, sortElement, order = 'ASC') => { // sortElement e case sensitive
	return new Promise((resolve, reject) => {
		try {
			let sortOrder = (order.toUpperCase() === 'DESC' ? { d: 1, a: -1 } : { d: -1, a: 1 }),
				sortData = jsonData.sort(
					(a, b) => {
						return ((a[sortElement] < b[sortElement]) ? sortOrder.d : ((a[sortElement] > b[sortElement]) ? sortOrder.a : 0));
					}
				);

			resolve({ sortData });
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
// -------------------------------------------------------------------------

module.exports = {
	setSorter,
	setPage
};
