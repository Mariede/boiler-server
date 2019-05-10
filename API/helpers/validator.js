"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Verifica se CNPJ e valido
const isCnpj = cnpj => {
	try {
		let peso1 = [5,4,3,2,9,8,7,6,5,4,3,2],
			peso2 = [6,5,4,3,2,9,8,7,6,5,4,3,2],
			resto = -1,
			soma = 0,
			vRet = false;

		cnpj = (cnpj || '').toString().replace(/\D/gi, '');

		// completa com zeros a esquerda
		if (cnpj.length < 14) {
			for (let i = 1; i <= 14; i++) {
				if (cnpj.length < 14) {
					cnpj = '0' + cnpj;
				}
			}
		}

		if (!cnpj.match(/^(0{14}|1{14}|2{14}|3{14}|4{14}|5{14}|6{14}|7{14}|8{14}|9{14})$/) && cnpj.length <= 14) {
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
	} catch(err) {
		throw new Error(err);
	}
};

// Verifica se CPF e valido
const isCpf = cpf => {
	try {
		let resto = -1,
			soma = 0,
			vRet = false;

		cpf = (cpf || '').toString().replace(/\D/gi, '');

		// completa com zeros a esquerda
		if (cpf.length < 11) {
			for (let i = 1; i <= 11; i++) {
				if (cpf.length < 11) {
					cpf = '0' + cpf;
				}
			}
		}

		if (!cpf.match(/^(0{11}|1{11}|2{11}|3{11}|4{11}|5{11}|6{11}|7{11}|8{11}|9{11})$/) && cpf.length <= 11) {
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
	} catch(err) {
		throw new Error(err);
	}
};

// Verifica se PIS/PASEP e valido
const isPisPasep = pisPasep => {
	try {
		let peso = [3,2,9,8,7,6,5,4,3,2],
			resto = -1,
			soma = 0,
			vRet = false;

		pisPasep = (pisPasep || '').toString().replace(/\D/gi, '');

		// completa com zeros a esquerda
		if (pisPasep.length < 11) {
			for (let i = 1; i <= 11; i++) {
				if (pisPasep.length < 11) {
					pisPasep = '0' + pisPasep;
				}
			}
		}

		if (!pisPasep.match(/^(0{11})$/)) {
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
	} catch(err) {
		throw new Error(err);
	}
};

// Verifica se email e valido
const isEmail = email => {
	try {
		let regExp = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i,
			vRet = false;

		if (email.match(regExp)) {
			vRet = true;
		}

		return vRet;
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

module.exports = {
	isCnpj,
	isCpf,
	isPisPasep,
	isEmail
};
