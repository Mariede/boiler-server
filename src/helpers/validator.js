'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Realiza analise de dado falsy (metodo privado)
const _falsyCheck = param => {
	const falsy = [null, undefined, NaN, false]; // Excecao => 0 / ""
	return (falsy.includes(param) ? param : (param === 0 ? param.toString() : (param || '').toString()));
};

// Verifica se CNPJ e valido
const isCnpj = _cnpj => {
	let cnpj = (_cnpj || '').toString().replace(/\D/gi, ''),
		peso1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
		peso2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
		resto = -1,
		soma = 0,
		vRet = false;

	// Completa com zeros a esquerda
	if (cnpj.length < 14) {
		for (let i = 1; i <= 14; i++) {
			if (cnpj.length < 14) {
				cnpj = '0' + cnpj;
			}
		}
	}

	if (!(/^(0{14}|1{14}|2{14}|3{14}|4{14}|5{14}|6{14}|7{14}|8{14}|9{14})$/).test(cnpj) && cnpj.length <= 14) {
		for (let i = 1; i <= 12; i++) {
			soma = soma + (parseInt(cnpj.substring(i - 1, i), 10) * peso1[i - 1]);
		}

		resto = soma % 11;

		if (resto >= 2) {
			resto = 11 - resto;
		} else {
			resto = 0;
		}

		if (resto === parseInt(cnpj.substring(12, 13), 10)) {
			soma = 0;

			for (let i = 1; i <= 13; i++) {
				soma = soma + (parseInt(cnpj.substring(i - 1, i), 10) * peso2[i - 1]);
			}

			resto = soma % 11;

			if (resto >= 2) {
				resto = 11 - resto;
			} else {
				resto = 0;
			}

			if (resto === parseInt(cnpj.substring(13, 14), 10)) {
				vRet = true;
			}
		}
	}

	return vRet;
};

// Verifica se CPF e valido
const isCpf = _cpf => {
	let cpf = (_cpf || '').toString().replace(/\D/gi, ''),
		resto = -1,
		soma = 0,
		vRet = false;

	// Completa com zeros a esquerda
	if (cpf.length < 11) {
		for (let i = 1; i <= 11; i++) {
			if (cpf.length < 11) {
				cpf = '0' + cpf;
			}
		}
	}

	if (!(/^(0{11}|1{11}|2{11}|3{11}|4{11}|5{11}|6{11}|7{11}|8{11}|9{11})$/).test(cpf) && cpf.length <= 11) {
		for (let i = 1; i <= 9; i++) {
			soma = soma + (parseInt(cpf.substring(i - 1, i), 10) * (11 - i));
		}

		resto = soma % 11;

		if (resto >= 2) {
			resto = 11 - resto;
		} else {
			resto = 0;
		}

		if (resto === parseInt(cpf.substring(9, 10), 10)) {
			soma = 0;

			for (let i = 1; i <= 10; i++) {
				soma = soma + (parseInt(cpf.substring(i - 1, i), 10) * (12 - i));
			}

			resto = soma % 11;

			if (resto >= 2) {
				resto = 11 - resto;
			} else {
				resto = 0;
			}

			if (resto === parseInt(cpf.substring(10, 11), 10)) {
				vRet = true;
			}
		}
	}

	return vRet;
};

// Verifica se PIS/PASEP e valido
const isPisPasep = _pisPasep => {
	let pisPasep = (_pisPasep || '').toString().replace(/\D/gi, ''),
		peso = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
		resto = -1,
		soma = 0,
		vRet = false;

	// Completa com zeros a esquerda
	if (pisPasep.length < 11) {
		for (let i = 1; i <= 11; i++) {
			if (pisPasep.length < 11) {
				pisPasep = '0' + pisPasep;
			}
		}
	}

	if (!(/^(0{11}|1{11}|2{11}|3{11}|4{11}|5{11}|6{11}|7{11}|8{11}|9{11})$/).test(pisPasep) && pisPasep.length <= 11) {
		for (let i = 1; i < 11; i++) {
			soma = soma + (parseInt(pisPasep.substring(i - 1, i), 10) * peso[i - 1]);
		}

		resto = 11 - (soma % 11);

		if ((resto === 10) || (resto === 11)) {
			resto = 0;
		}

		if (resto === parseInt(pisPasep.substring(10, 11), 10)) {
			vRet = true;
		}
	}

	return vRet;
};

// Verifica se email e valido
const isEmail = _email => {
	let email = (_email || '').toString(),
		regExp = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x21\x23-\x5b\x5d-\x7f]|\\[\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x21-\x5a\x53-\x7f]|\\[\x7f])+)\])$/i,
		vRet = false;

	if (regExp.test(email)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se CEP e valido
const isCep = (_cep, separator = true) => {
	let cep = (_cep || '').toString(),
		regExp = (separator ? /^([0-9]{5})-([0-9]{3})$/ : /^([0-9]{8})$/),
		vRet = false;

	if (regExp.test(cep)) {
		vRet = true;
	}

	return vRet;
};

/*
Verifica se valor e vazio
	* se trimmed === true	=> realiza trim automatico no _param de entrada
	* se implicit === true	=> valores falsy: null, undefined, NaN, false sao tratados como empty
*/
const isEmpty = (_param, trimmed = true, implicit = true) => {
	let param = _falsyCheck(_param),
		vRet = false;

	if (trimmed && param) {
		param = param.trim();
	}

	if (param === '') {
		vRet = true;
	} else {
		if (implicit && !param) {
			vRet = true;
		}
	}

	return vRet;
};

// Verifica se valor e alfanumerico
const isAlphaNumeric = (_param, spaceAndUnderscore = true) => {
	let param = (_param === true ? false : _falsyCheck(_param)),
		regExp = (spaceAndUnderscore ? /^([a-z0-9_ ]+)$/i : /^([a-z0-9]+)$/i),
		vRet = false;

	if (param && regExp.test(param)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se valor e numerico inteiro
const isInteger = (_num, signed = true) => {
	let num = _falsyCheck(_num),
		regExp = (signed ? /^([-+]?[0-9]+)$/ : /^([0-9]+)$/),
		vRet = false;

	if (num && regExp.test(num)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se valor e numerico e inteiro ou numerico com pontuacao flutuante variavel (sempre . como separador decimal)
const isIntegerOrFloat = (_num, signed = true) => {
	let num = _falsyCheck(_num),
		regExp = (signed ? /^([-+]?[0-9]+)((\.{1}[0-9]+)|())$/ : /^([0-9]+)((\.{1}[0-9]+)|())$/),
		vRet = false;

	if (num && regExp.test(num)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se valor e numerico e inteiro ou numerico com pontuacao flutuante fixa (sempre . como separador decimal)
const isIntegerOrFixed = (_num, fixedDecimal = 0, signed = true) => {
	let num = _falsyCheck(_num),
		regExp = (signed ? new RegExp('^([-+]?[0-9]+)((\\.{1}[0-9]{' + fixedDecimal + '})|())$') : new RegExp('^([0-9]+)((\\.{1}[0-9]{' + fixedDecimal + '})|())$')),
		vRet = false;

	if (num && regExp.test(num)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se data valida (dd/mm/yyyy ou dd-mm-yyyy ou dd.mm.yyyy)
const isDate = _date => {
	let date = (_date || '').toString(),
		regExp = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/,
		vRet = false;

	if (regExp.test(date) && date.length === 10) {
		vRet = true;
	}

	return vRet;
};

// Verifica se string _paramCompare esta contida em _param
const contains = (_param, _paramCompare, caseInsensitive = true) => {
	let param = (_param === true ? false : _falsyCheck(_param)),
		paramCompare = (_paramCompare === true ? false : _falsyCheck(_paramCompare)),
		vRet = false;

	if ((param === '' || param) && (paramCompare === '' || paramCompare)) {
		if (param.indexOf(paramCompare) !== -1 || (caseInsensitive && param.toUpperCase().indexOf(paramCompare.toUpperCase()) !== -1)) {
			vRet = true;
		}
	}

	return vRet;
};

// Verifica se string _paramCompare e identica a _param
const equal = (_param, _paramCompare, caseInsensitive = true) => {
	let param = (_param === true ? false : _falsyCheck(_param)),
		paramCompare = (_paramCompare === true ? false : _falsyCheck(_paramCompare)),
		vRet = false;

	if ((param === '' || param) && (paramCompare === '' || paramCompare)) {
		if (param === paramCompare || (caseInsensitive && param.toUpperCase() === paramCompare.toUpperCase())) {
			vRet = true;
		}
	}

	return vRet;
};

/*
Verifica limites de comprimento minimo e maximo para string _param
	* se lMax nao informado, assume o mesmo valor de lMin
*/
const lenRange = (_param, lMin = 0, lMax = lMin) => {
	let param = (_param === true ? false : _falsyCheck(_param)),
		paramLen = (param ? param.length : 0),
		vRet = false;

	if ((param === '' || param) && (paramLen >= lMin && paramLen <= lMax)) {
		vRet = true;
	}

	return vRet;
};
// -------------------------------------------------------------------------

module.exports = {
	isCnpj,
	isCpf,
	isPisPasep,
	isEmail,
	isCep,
	isEmpty,
	isAlphaNumeric,
	isInteger,
	isIntegerOrFloat,
	isIntegerOrFixed,
	isDate,
	contains,
	equal,
	lenRange
};
