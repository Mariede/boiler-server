'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Realiza analise de dado falsy (metodo privado)
const _falsyCheck = param => {
	const falsy = [null, undefined, NaN, false]; // Excecao => 0 / ""
	return (falsy.includes(param) ? param : (param === 0 ? param.toString() : (param || '').toString()));
};

// Verifica se CNPJ e valido
const isCnpj = _cnpj => {
	const peso1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
	const peso2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

	let cnpj = (_cnpj || '').toString().replace(/\D/gi, ''),
		resto = -1,
		soma = 0,
		vRet = false;

	// Completa com zeros a esquerda
	if (cnpj.length < 14) {
		for (let i = 1; i <= 14; i++) {
			if (cnpj.length < 14) {
				cnpj = `0${cnpj}`;
			}
		}
	}

	if (!(/([0-9])\1{13,}/).test(cnpj) && cnpj.length <= 14) {
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
				cpf = `0${cpf}`;
			}
		}
	}

	if (!(/([0-9])\1{10,}/).test(cpf) && cpf.length <= 11) {
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

// Verifica se CNH e valida
const isCnh = _cnh => {
	let cnh = (_cnh || '').toString().replace(/\D/gi, ''),
		resto = -1,
		soma = 0,
		decr = 0,
		vRet = false;

	// Completa com zeros a esquerda
	if (cnh.length < 11) {
		for (let i = 1; i <= 11; i++) {
			if (cnh.length < 11) {
				cnh = `0${cnh}`;
			}
		}
	}

	if (!(/([0-9])\1{10,}/).test(cnh) && cnh.length <= 11) {
		for (let i = 1; i <= 9; i++) {
			soma = soma + (parseInt(cnh.substring(i - 1, i), 10) * (10 - i));
		}

		resto = soma % 11;

		if ((resto === 10) || (resto === 11)) {
			resto = 0;
			decr = 2;
		}

		if (resto === parseInt(cnh.substring(9, 10), 10)) {
			soma = 0;

			for (let i = 1; i <= 9; i++) {
				soma = soma + (parseInt(cnh.substring(i - 1, i), 10) * i);
			}

			resto = soma % 11;

			if ((resto === 10) || (resto === 11)) {
				resto = 0;
			} else {
				resto = resto - decr;
			}

			if (resto === parseInt(cnh.substring(10, 11), 10)) {
				vRet = true;
			}
		}
	}

	return vRet;
};

// Verifica se PIS/PASEP e valido
const isPisPasep = _pisPasep => {
	const peso = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

	let pisPasep = (_pisPasep || '').toString().replace(/\D/gi, ''),
		resto = -1,
		soma = 0,
		vRet = false;

	// Completa com zeros a esquerda
	if (pisPasep.length < 11) {
		for (let i = 1; i <= 11; i++) {
			if (pisPasep.length < 11) {
				pisPasep = `0${pisPasep}`;
			}
		}
	}

	if (!(/([0-9])\1{10,}/).test(pisPasep) && pisPasep.length <= 11) {
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

// Verifica se RENAVAM do veiculo e valido
const isRenavam = _renavam => {
	const peso = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

	let renavam = (_renavam || '').toString().replace(/\D/gi, ''),
		resto = -1,
		soma = 0,
		vRet = false;

	// Completa com zeros a esquerda
	if (renavam.length < 11) {
		for (let i = 1; i <= 11; i++) {
			if (renavam.length < 11) {
				renavam = `0${renavam}`;
			}
		}
	}

	if (!(/([0-9])\1{10,}/).test(renavam) && renavam.length <= 11) {
		for (let i = 1; i < 11; i++) {
			soma = soma + (parseInt(renavam.substring(i - 1, i), 10) * peso[i - 1]);
		}

		resto = 11 - (soma % 11);

		if ((resto === 10) || (resto === 11)) {
			resto = 0;
		}

		if (resto === parseInt(renavam.substring(10, 11), 10)) {
			vRet = true;
		}
	}

	return vRet;
};

// Verifica se email e valido
const isEmail = _email => {
	const email = (_email || '').toString();
	const regExp = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x21\x23-\x5b\x5d-\x7f]|\\[\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x21-\x5a\x53-\x7f]|\\[\x7f])+)\])$/i;

	let vRet = false;

	if (regExp.test(email)) {
		vRet = true;
	}

	return vRet;
};

/*
Verifica se CEP e valido
*/
const isCep = _cep => {
	const cep = (_cep || '').toString();
	const regExp = /^([0-9]{5})[ -]?([0-9]{3})$/;

	let vRet = false;

	if (regExp.test(cep)) {
		vRet = true;
	}

	return vRet;
};

/*
Verifica se nome e completo: com pelo menos uma letra, um espaco e duas letra em sequencia
*/
const isCompleteName = _name => {
	const name = (_name || '').toString().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	const regExp = /([a-zA-Z]{1,})(\s{1})([a-zA-Z]{2,})/;

	let vRet = false;

	if (regExp.test(name)) {
		vRet = true;
	}

	return vRet;
};

/*
Verifica se valor e vazio
	* se trimmed === true	=> realiza trim automatico no _param de entrada
	* se implicit === true	=> valores falsy: null, undefined, NaN, false sao tratados como empty

	** Verifica se array e vazia
*/
const isEmpty = (_param, trimmed = true, implicit = true) => {
	let param = _falsyCheck(_param),
		vRet = false;

	if (!Array.isArray(param)) {
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
	} else {
		if (param.length === 0) {
			vRet = true;
		}
	}

	return vRet;
};

// Verifica se valor e alfanumerico
const isAlphaNumeric = (_param, spaceAndUnderscore = true) => {
	const param = (_param === true ? false : _falsyCheck(_param));
	const regExp = (spaceAndUnderscore ? /^([a-z0-9_ ]+)$/i : /^([a-z0-9]+)$/i);

	let vRet = false;

	if (param && regExp.test(param)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se valor e booleano
const isBoolean = _param => {
	const regExp = /^(true|false)$/;

	let vRet = false;

	if (regExp.test(_param)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se valor e numerico inteiro
const isInteger = (_num, signed = true) => {
	const num = _falsyCheck(_num);
	const regExp = (signed ? /^([-+]?[0-9]+)$/ : /^([0-9]+)$/);

	let vRet = false;

	if (num && regExp.test(num)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se valor e numerico e inteiro ou numerico com pontuacao flutuante variavel (sempre . como separador decimal)
const isIntegerOrFloat = (_num, signed = true) => {
	const num = _falsyCheck(_num);
	const regExp = (signed ? /^([-+]?[0-9]+)(\.{1}[0-9]+)?$/ : /^([0-9]+)(\.{1}[0-9]+)?$/);

	let vRet = false;

	if (num && regExp.test(num)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se valor e numerico e inteiro ou numerico com pontuacao flutuante fixa (sempre . como separador decimal)
const isIntegerOrFixed = (_num, fixedDecimal = 1, signed = true) => {
	const num = _falsyCheck(_num);
	const regExp = (signed ? new RegExp(`^([-+]?[0-9]+)(\\.{1}[0-9]{1,${fixedDecimal || 1}})?$`) : new RegExp(`^([0-9]+)(\\.{1}[0-9]{1,${fixedDecimal || 1}})?$`));

	let vRet = false;

	if (num && regExp.test(num)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se data valida (dd/mm/yyyy ou dd-mm-yyyy ou dd.mm.yyyy)
const isDate = _date => {
	const date = (_date || '').toString();
	const regExp = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;

	let vRet = false;

	if (regExp.test(date) && date.length === 10) {
		vRet = true;
	}

	return vRet;
};

/*
Verifica a placa do carro nacional (BR / Mercosul)
*/
const isVehicleLicensePlate = _licensePlate => {
	const licensePlate = (_licensePlate || '').toString();

	const regExpBrNationalPlateOld = /^[ ]?([a-zA-Z]{2})[ ]?[ -]?([0-9]{4})$/;
	const regExpBrNationalPlateNew = /^([a-zA-Z]{3})[ -]?([0-9]{4})$/;
	const regExpBrMercosulPlate1 = /^([a-zA-Z]{3})[ -]?([0-9][a-zA-Z][0-9]{2})$/; // Carros
	const regExpBrMercosulPlate2 = /^([a-zA-Z]{3})[ -]?([0-9]{2}[a-zA-Z][0-9])$/; // Motos

	let vRet = false;

	if (regExpBrNationalPlateOld.test(licensePlate) || regExpBrNationalPlateNew.test(licensePlate) || regExpBrMercosulPlate1.test(licensePlate) || regExpBrMercosulPlate2.test(licensePlate)) {
		vRet = true;
	}

	return vRet;
};

// Verifica o numero do chassi do veiculo
const isVehicleChassis = _chassis => {
	const chassis = (_chassis || '').toString();
	const regExpChassisBasePrior1981 = /^[a-zA-Z0-9]{5,13}$/;
	const regExpChassisBaseAfter1981 = /^(?!.*?[ioqIOQ])([a-zA-Z1-9]{1})([a-zA-Z0-9]{9,12})([0-9]{4})$/;
	const regExpChassisRepeated = /([a-zA-Z0-9])\1{5,}/g;

	let vRet = false;

	if ((regExpChassisBasePrior1981.test(chassis) || regExpChassisBaseAfter1981.test(chassis)) && !regExpChassisRepeated.test(chassis)) {
		vRet = true;
	}

	return vRet;
};

// Verifica se string _paramCompare esta contida em _param
const contains = (_param, _paramCompare, caseInsensitive = false) => {
	const param = (_param === true ? false : _falsyCheck(_param));
	const paramCompare = (_paramCompare === true ? false : _falsyCheck(_paramCompare));

	let vRet = false;

	if ((param === '' || param) && (paramCompare === '' || paramCompare)) {
		if (param.indexOf(paramCompare) !== -1 || (caseInsensitive && param.toUpperCase().indexOf(paramCompare.toUpperCase()) !== -1)) {
			vRet = true;
		}
	}

	return vRet;
};

// Verifica se string _paramCompare e identica a _param
const equal = (_param, _paramCompare, caseInsensitive = false) => {
	const param = (_param === true ? false : _falsyCheck(_param));
	const paramCompare = (_paramCompare === true ? false : _falsyCheck(_paramCompare));

	let vRet = false;

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
const lenRange = (_param, lMin = 0, lMax = lMin, trimmed = true) => {
	const param = (_param === true ? false : _falsyCheck(_param));
	const paramLen = (param ? (trimmed ? param.trim().length : param.length) : 0);

	let vRet = false;

	if ((param === '' || param) && (paramLen >= lMin && paramLen <= lMax)) {
		vRet = true;
	}

	return vRet;
};

/*
Verifica se valor numerico se encontra no intervalo especificado
	* se vMax nao informado, assume o mesmo valor de vMin
*/
const valueRange = (_num, vMin = 0, vMax = vMin) => {
	const num = _falsyCheck(_num) && Number(_num);

	let vRet = false;

	if ((typeof num === 'number') && (num >= vMin && num <= vMax)) {
		vRet = true;
	}

	return vRet;
};
// -------------------------------------------------------------------------

module.exports = {
	isCnpj,
	isCpf,
	isCnh,
	isPisPasep,
	isRenavam,
	isEmail,
	isCep,
	isCompleteName,
	isEmpty,
	isAlphaNumeric,
	isBoolean,
	isInteger,
	isIntegerOrFloat,
	isIntegerOrFixed,
	isDate,
	isVehicleLicensePlate,
	isVehicleChassis,
	contains,
	equal,
	lenRange,
	valueRange
};
