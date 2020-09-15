'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const dbCon = require('@serverRoot/helpers/db');
const errWrapper = require('@serverRoot/helpers/err-wrapper');
const paginator = require('@serverRoot/helpers/paginator');
const validator = require('@serverRoot/helpers/validator');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Constantes gerais
// utilizar key como 'OPTIONS.XXX', pois vai ajustar os niveis json ao converter para camelCase em paginator
const recordsetEnumOptions = {
	ativo: {
		key: 'OPTIONS.ATIVO',
		content: [
			{
				id: 1,
				nome: 'ATIVO'
			},
			{
				id: 2,
				nome: 'INATIVO'
			}
		]
	}
};

// Acoes
const consultarTodos = async (req, res) => {
	const query = {
		formato: 1,
		dados: {
			executar: `
				SELECT
					A.ID_USUARIO
					,A.NOME
					,A.EMAIL
					,A.SENHA
					,A.SALT
					,A.ATIVO
					,A.ID_TIPO [TIPO.ID]
					,B.TIPO [TIPO.NOME]
					,(
						SELECT
							D.ID_PERFIL [ID]
							,D.PERFIL [NOME]
						FROM
							PERFIL_USUARIO C (NOLOCK)
							INNER JOIN PERFIL D (NOLOCK)
								ON C.ID_PERFIL = D.ID_PERFIL
						WHERE
							A.ID_USUARIO = C.ID_USUARIO
						FOR XML PATH ('PERFIL'), ROOT('PERFIS')
					) [PERFIS]
				FROM
					USUARIO A (NOLOCK)
					INNER JOIN TIPO B (NOLOCK)
						ON (A.ID_TIPO = B.ID_TIPO);

				SELECT
					ID_TIPO [ID]
					,TIPO [NOME]
				FROM
					TIPO (NOLOCK)
				ORDER BY
					TIPO DESC;

				SELECT
					ID_PERFIL [ID]
					,PERFIL [NOME]
				FROM
					PERFIL (NOLOCK)
				ORDER BY
					PERFIL;
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	// Adiciona chaves extras ao resultset oficial (options)
	resultSet.recordsets[0] = paginator.addKeysToRecords(
		resultSet.recordsets[0],
		[
			{
				key: 'OPTIONS.TIPOS',
				content: Array.from(resultSet.recordsets[1])
			},
			{
				key: 'OPTIONS.PERFIS',
				content: Array.from(resultSet.recordsets[2])
			},
			recordsetEnumOptions.ativo
		]
	);

	// Ordenador, chaves para camelCase
	resultSet.recordsets[0] = paginator.setSort(req, resultSet.recordsets[0], [{ xmlRoot: 'PERFIS', xmlPath: 'PERFIL' }]);

	// Paginador
	const pagedResultSet = paginator.setPage(req, resultSet, resultSet.recordsets[0], resultSet.rowsAffected[0]);

	return pagedResultSet;
};

const consultar = async (req, res) => {
	// Parametros de entrada
	const idUsuario = req.params.id;
	// -------------------------------------------------------------------------

	// Validacoes entrada
	if (!validator.isInteger(idUsuario, false)) {
		errWrapper.throwThis('USUARIO', 400, 'ID do usuário deve ser numérico...');
	}
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario]
			],
			executar: `
				SELECT
					A.ID_USUARIO
					,A.NOME
					,A.EMAIL
					,A.SENHA
					,A.SALT
					,A.ATIVO
					,A.ID_TIPO [TIPO.ID]
					,B.TIPO [TIPO.NOME]
					,(
						SELECT
							D.ID_PERFIL [ID]
							,D.PERFIL [NOME]
						FROM
							PERFIL_USUARIO C (NOLOCK)
							INNER JOIN PERFIL D (NOLOCK)
								ON C.ID_PERFIL = D.ID_PERFIL
						WHERE
							A.ID_USUARIO = C.ID_USUARIO
						FOR XML PATH ('PERFIL'), ROOT('PERFIS')
					) [PERFIS]
				FROM
					USUARIO A (NOLOCK)
					INNER JOIN TIPO B (NOLOCK)
						ON (A.ID_TIPO = B.ID_TIPO)
				WHERE
					A.ID_USUARIO = @idUsuario;

				SELECT
					ID_TIPO [ID]
					,TIPO [NOME]
				FROM
					TIPO (NOLOCK)
				ORDER BY
					TIPO DESC;

				SELECT
					ID_PERFIL [ID]
					,PERFIL [NOME]
				FROM
					PERFIL (NOLOCK)
				ORDER BY
					PERFIL;
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	// Adiciona chaves extras ao resultset oficial (options)
	resultSet.recordsets[0] = paginator.addKeysToRecords(
		resultSet.recordsets[0],
		[
			{
				key: 'OPTIONS.TIPOS',
				content: Array.from(resultSet.recordsets[1])
			},
			{
				key: 'OPTIONS.PERFIS',
				content: Array.from(resultSet.recordsets[2])
			},
			recordsetEnumOptions.ativo
		]
	);

	// Para o caso de mais de um recordset no result, mantem apenas o recordset oficial, chaves para camelCase
	const settedResult = paginator.setResult(resultSet, resultSet.recordsets[0], resultSet.rowsAffected[0], [{ xmlRoot: 'PERFIS', xmlPath: 'PERFIL' }]);

	return settedResult;
};

const inserir = (req, res) => {
	const fRet = 'insere usuario';

	return `${fRet}`;
};

const alterar = async (req, res) => {
	// Parametros de entrada
	const idUsuario = req.params.id;
	const nome = req.body.nome;
	const email = req.body.email;
	const tipo = req.body.tipo;
	const ativo = req.body.ativo === '1';
	// -------------------------------------------------------------------------

	// Validacoes entrada
	if (!validator.isInteger(idUsuario, false)) {
		errWrapper.throwThis('USUARIO', 400, 'ID do usuário deve ser numérico...');
	}

	// Stack de erros
	const errorStack = [];

	if (validator.isEmpty(nome)) {
		errorStack.push('Nome não pode ser vazio...');
	} else {
		if (!validator.isCompleteName(nome)) {
			errorStack.push('Nome não parece completo...');
		}
	}

	if (validator.isEmpty(email)) {
		errorStack.push('E-mail não pode ser vazio...');
	} else {
		if (!validator.isEmail(email)) {
			errorStack.push('E-mail inválido...');
		}
	}

	if (validator.isEmpty(tipo)) {
		errorStack.push('Tipo não pode ser vazio...');
	} else {
		if (!validator.isInteger(tipo, false)) {
			errorStack.push('Tipo inválido...');
		}
	}

	if (errorStack.length !== 0) {
		errWrapper.throwThis('USUARIO', 400, errorStack);
	}
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario],
				['nome', 'varchar(200)', nome],
				['email', 'varchar(200)', email],
				['tipo', 'int', parseInt(tipo, 10)],
				['ativo', 'bit', ativo]
			],
			executar: `
				UPDATE
					A
				SET
					A.NOME = @nome,
					A.EMAIL = @email,
					A.ID_TIPO = @tipo,
					A.ATIVO = @ativo
				FROM
					USUARIO A
				WHERE
					A.ID_USUARIO = @idUsuario;
			`
		}
	};

	await dbCon.msSqlServer.sqlExecuteAll(query);

	return idUsuario;
};

const excluir = async (req, res) => {
	// Parametros de sessao
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;
	// -------------------------------------------------------------------------

	// Parametros de entrada
	const idUsuario = req.params.id;
	// -------------------------------------------------------------------------

	// Validacoes entrada
	if (!validator.isInteger(idUsuario, false)) {
		errWrapper.throwThis('USUARIO', 400, 'ID do usuário deve ser numérico...');
	}

	if (!sess[sessWraper] || sess[sessWraper].id === parseInt(idUsuario, 10)) {
		errWrapper.throwThis('USUARIO', 400, 'Não é possível realizar esta operação em si mesmo...');
	}
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario]
			],
			executar: `
				DELETE
				FROM
					PERFIL_USUARIO
				WHERE
					ID_USUARIO = @idUsuario;

				DELETE
				FROM
					USUARIO
				WHERE
					ID_USUARIO = @idUsuario;
			`
		}
	};

	await dbCon.msSqlServer.sqlExecuteAll(query);

	return idUsuario;
};

const ativacao = async (req, res) => {
	// Parametros de sessao
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;
	// -------------------------------------------------------------------------

	// Parametros de entrada
	const idUsuario = req.params.id;
	const ativo = req.body.ativo === true;
	// -------------------------------------------------------------------------

	// Validacoes entrada
	if (!validator.isInteger(idUsuario, false)) {
		errWrapper.throwThis('USUARIO', 400, 'ID do usuário deve ser numérico...');
	}

	if (!sess[sessWraper] || sess[sessWraper].id === parseInt(idUsuario, 10)) {
		errWrapper.throwThis('USUARIO', 400, 'Não é possível realizar esta operação em si mesmo...');
	}
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario],
				['ativo', 'bit', !ativo]
			],
			executar: `
				UPDATE
					A
				SET
					A.ATIVO = @ativo
				FROM
					USUARIO A
				WHERE
					A.ID_USUARIO = @idUsuario;
			`
		}
	};

	await dbCon.msSqlServer.sqlExecuteAll(query);

	return idUsuario;
};
// -------------------------------------------------------------------------

module.exports = {
	consultarTodos,
	consultar,
	inserir,
	alterar,
	excluir,
	ativacao
};
