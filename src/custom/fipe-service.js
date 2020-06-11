'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const axios = require('axios');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const errWrapper = require('@serverRoot/helpers/err-wrapper');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
/*
Tipos disponivels para consulta na API da FIPE (metodo privado)
	1 => carros
	2 => motos
	3 => caminhoes
*/
const _types = _type => {
	const types = [
		'carros',
		'motos',
		'caminhoes'
	];

	const type = (/^[1-3]{1}$/.test(_type) ? parseInt(_type, 10) : null);
	const result = types[type - 1];

	if (!result) {
		errWrapper.throwThis('FIPE-SERVICE', 400, 'Tipo definido para consulta inválido...');
	}

	return result;
};

/*
Compara se _sCheck esta contido em _sBase (metodo privado)

	* validacao por palavra-chave, separadas por espaco caso mais de uma
*/
const _keywordCheck = (_sBase, _sCheck) => {
	const sBase = String(_sBase || '').trim().toLowerCase();
	const sCheck = _sCheck.trim().toLowerCase();

	return (
		sCheck.split(' ').every(
			wordCheck => {
				return sBase.includes(wordCheck);
			}
		)
	);
};

/*
Retorna marcas ou marca (API FIPE)
	_brand => Se string verifica se o nome contem, se inteiro e numerico pocura id exato (vazio para todos)

	* retorna array

	ex: brand(59) ou brand('volks')
*/
const brand = (_brand = '', _type = 1) => {
	return new Promise((resolve, reject) => {
		const brand = ((/^([0-9]+)$/.test(_brand) && typeof _brand === 'number') ? _brand : String(_brand || ''));
		const type = _types(_type);
		const address = `${__serverConfig.server.custom.fipe.address}/${type}/marcas.json`;

		axios
		.get(
			address
		)
		.then(
			result => {
				const data = result.data;

				resolve(
					{
						type: type,
						data: (
							Array.isArray(data) ? (
								data.filter(
									item => {
										if (typeof brand === 'number') {
											return item.id === brand;
										}

										return _keywordCheck(item.name, brand);
									}
								)
							) : (
								data
							)
						)
					}
				);
			}
		)
		.catch(
			err => {
				reject(
					errWrapper.returnThis('FIPE-SERVICE', 500, err)
				);
			}
		);
	});
};

/*
Retorna veiculos por modelos ou veiculo por modelo (API FIPE)
	brand => Indica o id numerico da marca
	_model => Se string verifica se o nome contem, se inteiro e numerico pocura id exato (vazio para todos)

	* marca e obrigatoria
	* retorna array

	ex: brandModel(59, 5599) ou brandModel(59, 'fox rock rio')
*/
const brandModel = (brand, _model = '', _type = 1) => {
	return new Promise((resolve, reject) => {
		const model = ((/^([0-9]+)$/.test(_model) && typeof _model === 'number') ? _model : String(_model || ''));
		const type = _types(_type);
		const address = `${__serverConfig.server.custom.fipe.address}/${type}/veiculos/${String(brand || '')}.json`;

		axios
		.get(
			address
		)
		.then(
			result => {
				const data = result.data;

				resolve(
					{
						type: type,
						data: (
							Array.isArray(data) ? (
								data.filter(
									item => {
										if (typeof model === 'number') {
											return item.id === String(model); // A chave id no objeto e string
										}

										return _keywordCheck(item.name, model);
									}
								)
							) : (
								data
							)
						)
					}
				);
			}
		)
		.catch(
			err => {
				reject(
					errWrapper.returnThis('FIPE-SERVICE', 500, err)
				);
			}
		);
	});
};

/*
Retorna modelo especifico de veiculo por detalhes (API FIPE)
	search => objeto informa brand/model ou brand/model/detais (verificar por ids)
	_details => Se string verifica se o nome contem (vazio para todos)

	* search e obrigatorio
	* se brand/model retorna array, se brand/model/details retorna "objeto completo"
	* caso retorno seja "objeto completo" (brand/model/details) o valor para filter em _details e descartado

	ex:
		- vehicle({ brand: 59, model: 5599 })
		- ou vehicle({ brand: 59, model: 5599 }, '2016')
		- ou vehicle({ brand: 59, model: 5599, details: '2016-1' })
		- ou vehicle({ brand: 59, model: '005332-5', details: '2016-1' })
*/
const vehicle = (search, _details = '', _type = 1) => {
	return new Promise((resolve, reject) => {
		const mountQuery = _search => {
			let resultQuery = '';

			if (typeof _search === 'object' && _search !== null) {
				if (Object.keys(_search).length === 2) {
					if (Object.prototype.hasOwnProperty.call(_search, 'brand') && Object.prototype.hasOwnProperty.call(_search, 'model')) {
						resultQuery = `${_search.brand}/${_search.model}.json`;
					}
				} else {
					if (Object.keys(_search).length === 3) {
						if (Object.prototype.hasOwnProperty.call(_search, 'brand') && Object.prototype.hasOwnProperty.call(_search, 'model') && Object.prototype.hasOwnProperty.call(_search, 'details')) {
							resultQuery = `${_search.brand}/${_search.model}/${_search.details}.json`;
						}
					}
				}
			}

			if (!resultQuery) {
				errWrapper.throwThis('FIPE-SERVICE', 400, 'Parâmetro definido para consulta inválido, utilize um objeto no seguinte formato: { brand: , model: } ou { brand: , model: , details: }...');
			}

			return resultQuery;
		};

		const details = String(_details || '');
		const type = _types(_type);
		const address = `${__serverConfig.server.custom.fipe.address}/${type}/veiculo/${mountQuery(search)}`;

		axios
		.get(
			address
		)
		.then(
			result => {
				const data = result.data;

				resolve(
					{
						type: type,
						data: (
							Array.isArray(data) ? (
								data.filter(
									item => {
										return _keywordCheck(item.name, details);
									}
								)
							) : (
								data
							)
						)
					}
				);
			}
		)
		.catch(
			err => {
				reject(
					errWrapper.returnThis('FIPE-SERVICE', 500, err)
				);
			}
		);
	});
};
// -------------------------------------------------------------------------

module.exports = {
	brand,
	brandModel,
	vehicle
};
