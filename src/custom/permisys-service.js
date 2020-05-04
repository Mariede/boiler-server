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
// Logon via permisys
const logon = (login, senha, idTipoUsuario = 0) => {
	return new Promise((resolve, reject) => {
		const address = `${__serverConfig.server.custom.permisys.address}/verificarLogon`;
		const siglaSistema = __serverConfig.server.custom.permisys.siglaSistema;
		const idModulo = __serverConfig.server.custom.permisys.idModulo; // Se nao informado checa credenciais mas nao autoriza

		const config = {
			headers: {
				Authorization: __serverConfig.server.custom.permisys.headers.authorization
			}
		};

		const dataSend = {};

		if (siglaSistema) {
			dataSend.siglaSistema = siglaSistema;
		}

		if (idModulo) {
			dataSend.idModulo = idModulo;
		}

		if (login) {
			dataSend.login = login;
		}

		if (senha) {
			dataSend.senha = senha;
		}

		if (idTipoUsuario) { // Se 0 ou vazio tenta detectar automaticamente
			dataSend.idTipoUsuario = idTipoUsuario;
		}

		axios
		.post(
			address,
			dataSend,
			config
		)
		.then(
			result => {
				resolve(result.data);
			}
		)
		.catch(
			err => {
				reject(
					errWrapper.returnThis('PERMISYS', 500, err)
				);
			}
		);
	});
};
// -------------------------------------------------------------------------

module.exports = {
	logon
};
