'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const cryptoHash = require('@serverRoot/helpers/crypto-hash');
const dbCon = require('@serverRoot/helpers/db');
const errWrapper = require('@serverRoot/helpers/err-wrapper');
const paginator = require('@serverRoot/helpers/paginator');
const searcher = require('@serverRoot/helpers/searcher');
const validator = require('@serverRoot/helpers/validator');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
/*
Constantes gerais
	- utilizar key como 'OPTIONS.XXX'
	- ajuste automatico dos niveis json ao converter para camelCase em paginator, quando necessario
	- na rota options a propriedade key nao e utilizada
*/
const enumOptions = {
	ativo: {
		key: 'OPTIONS.ATIVO',
		content: [
			{
				id: true,
				nome: 'ATIVO'
			},
			{
				id: false,
				nome: 'INATIVO'
			}
		]
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
/*
Funcoes compartilhadas
	- validacao comum para insert e update de usuarios
*/
const _commonValidationErrStack = (isNewRecord, nome, email, tipo, ativo, cep, cpf, detalhes, perfis, senha, senhaCheck) => {
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

	if (validator.isEmpty(ativo, true, false)) { // Nao considera false vazio
		errorStack.push('Estado não pode ser vazio...');
	} else {
		if (!validator.isBoolean(ativo)) {
			errorStack.push('Estado inválido...');
		}
	}

	if (!validator.isEmpty(cep)) {
		if (!validator.isCep(cep)) {
			errorStack.push('CEP inválido...');
		}
	}

	if (!validator.isEmpty(cpf)) {
		if (!validator.isCpf(cpf)) {
			errorStack.push('CPF inválido...');
		}
	}

	if (!validator.isEmpty(detalhes)) {
		if (!validator.lenRange(detalhes, 5, 8000)) {
			errorStack.push('Detalhes deve possuir entre 5 e 8000 caracteres...');
		}
	}

	if (validator.isEmpty(perfis)) {
		errorStack.push('Perfis não pode ser vazio...');
	}

	// Apenas para novos usuarios
	if (isNewRecord) {
		if (validator.isEmpty(senha)) {
			errorStack.push('Senha não pode ser vazia...');
		} else {
			if (validator.isEmpty(senhaCheck)) {
				errorStack.push('Confirmação de senha não pode ser vazia...');
			} else {
				if (!validator.equal(senhaCheck, senha)) {
					errorStack.push('Confirmação de senha não confere...');
				}
			}
		}
	}

	if (errorStack.length !== 0) {
		errWrapper.throwThis('USUARIO', 400, errorStack);
	}
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const consultarTodos = async (req, res) => {
	const replaceQuery = '{{REPLACE}}';
	const baseQuery = `
		-- Dados dos usuario (via searcher)
		SELECT DISTINCT
			A.ID_USUARIO
			,A.NOME
			,A.EMAIL
			,A.ATIVO
			,A.CEP
			,A.CPF
			,A.DETALHES
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
			INNER JOIN PERFIL_USUARIO C (NOLOCK)
				ON (A.ID_USUARIO = C.ID_USUARIO)
			INNER JOIN PERFIL D (NOLOCK)
				ON (C.ID_PERFIL = D.ID_PERFIL)
		${replaceQuery}
		-- ----------------------------------------
	`;

	// Searcher: colunas invalidas para pesquisa geram erro
	const resultSet = await searcher.setSearch(
		req,
		baseQuery,
		replaceQuery
	);

	// Ordenador, chaves para camelCase
	resultSet.recordset = paginator.setSort(req, resultSet.recordset, [{ xmlRoot: 'PERFIS', xmlPath: 'PERFIL' }]);

	// Paginador
	const pagedResultSet = paginator.setPage(req, resultSet, resultSet.recordset, resultSet.rowsAffected);

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
				-- Dados do usuario
				SELECT
					A.ID_USUARIO
					,A.NOME
					,A.EMAIL
					,A.ATIVO
					,A.CEP
					,A.CPF
					,A.DETALHES
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
				-- ----------------------------------------

				-- Retorna opcoes na mesma chamada, no mesmo json de retorno
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
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	// Adiciona chaves extras ao resultset inicial (options acoplado)
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
			enumOptions.ativo
		]
	);

	// Para o caso de mais de um recordset no result, mantem apenas o recordset inicial, chaves para camelCase
	const settedResult = paginator.setResult(resultSet, resultSet.recordsets[0], resultSet.rowsAffected[0], [{ xmlRoot: 'PERFIS', xmlPath: 'PERFIL' }]);

	return settedResult;
};

const inserir = async (req, res) => {
	// Parametros de entrada
	const nome = req.body.nome;
	const email = req.body.email;
	const tipo = req.body.tipo;
	const ativo = req.body.ativo;
	const cep = String(req.body.cep).replace(/\D/g, ''); // Mascara no formulario
	const cpf = String(req.body.cpf).replace(/\D/g, ''); // Mascara no formulario
	const detalhes = req.body.detalhes;
	const perfis = dbCon.msSqlServer.sanitize(req.body.perfis);

	// Senha inicial
	const senha = req.body.senha;
	const senhaCheck = req.body.senhaCheck;
	const salt = cryptoHash.generateSalt(5, false);
	// -------------------------------------------------------------------------

	// Validacoes entrada
	// Stack de erros
	_commonValidationErrStack(true, nome, email, tipo, ativo, cep, cpf, detalhes, perfis, senha, senhaCheck);
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['nome', 'varchar(200)', nome],
				['email', 'varchar(200)', email],
				['senha', 'varchar(128)', cryptoHash.hash(senha, salt).passHash],
				['salt', 'varchar(5)', salt],
				['tipo', 'int', tipo],
				['ativo', 'bit', ativo],
				['cep', 'numeric(8, 0)', (cep ? Number(cep) : null)],
				['cpf', 'numeric(11, 0)', (cpf ? Number(cpf) : null)],
				['detalhes', 'varchar(max)', detalhes || null]
			],
			output: [
				['id', 'int']
			],
			executar: `
				-- Cria novo usuario
				INSERT INTO USUARIO(
					ID_TIPO
					,NOME
					,EMAIL
					,SENHA
					,SALT
					,ATIVO
					,CEP
					,CPF
					,DETALHES
				)
				VALUES(
					@tipo
					,@nome
					,@email
					,@senha
					,@salt
					,@ativo
					,@cep
					,@cpf
					,@detalhes
				);

				SET @id = SCOPE_IDENTITY();

				DELETE
				FROM
					PERFIL_USUARIO
				WHERE
					ID_USUARIO = @id;

				INSERT INTO PERFIL_USUARIO(
					ID_PERFIL
					,ID_USUARIO
				)
				VALUES ${
					perfis.map(
						perfil => {
							return `\n(${perfil}, @id)`;
						}
					)
				}
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	return resultSet.output;
};

const alterar = async (req, res) => {
	// Parametros de sessao
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;
	// -------------------------------------------------------------------------

	// Parametros de entrada
	const idUsuario = req.params.id;
	const nome = req.body.nome;
	const email = req.body.email;
	const tipo = req.body.tipo;
	const ativo = req.body.ativo;
	const cep = String(req.body.cep).replace(/\D/g, ''); // Mascara no formulario
	const cpf = String(req.body.cpf).replace(/\D/g, ''); // Mascara no formulario
	const detalhes = req.body.detalhes;
	const perfis = dbCon.msSqlServer.sanitize(req.body.perfis);
	// -------------------------------------------------------------------------

	// Validacoes entrada
	if (!validator.isInteger(idUsuario, false)) {
		errWrapper.throwThis('USUARIO', 400, 'ID do usuário deve ser numérico...');
	}

	if (sess[sessWraper].id === parseInt(idUsuario, 10) && !ativo) {
		errWrapper.throwThis('USUARIO', 400, 'Não é possível desativar a si mesmo...');
	}

	// Stack de erros
	_commonValidationErrStack(false, nome, email, tipo, ativo, cep, cpf, detalhes, perfis);
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario],
				['nome', 'varchar(200)', nome],
				['email', 'varchar(200)', email],
				['tipo', 'int', tipo],
				['ativo', 'bit', ativo],
				['cep', 'numeric(8, 0)', (cep ? Number(cep) : null)],
				['cpf', 'numeric(11, 0)', (cpf ? Number(cpf) : null)],
				['detalhes', 'varchar(max)', detalhes || null]
			],
			output: [
				['id', 'int']
			],
			executar: `
				-- Atualiza usuario
				UPDATE
					A
				SET
					A.NOME = @nome
					,A.EMAIL = @email
					,A.ID_TIPO = @tipo
					,A.ATIVO = @ativo
					,A.CEP = @cep
					,A.CPF = @cpf
					,A.DETALHES = @detalhes
				FROM
					USUARIO A
				WHERE
					A.ID_USUARIO = @idUsuario;

				DELETE
				FROM
					PERFIL_USUARIO
				WHERE
					ID_USUARIO = @idUsuario;

				INSERT INTO PERFIL_USUARIO(
					ID_PERFIL
					,ID_USUARIO
				)
				VALUES ${
					perfis.map(
						perfil => {
							return `\n(${perfil}, @idUsuario)`;
						}
					)
				}

				SET @id = @idUsuario;
				-- ----------------------------------------

				-- Se dados alterados forem do usuario logado, atualiza a sessao
				SELECT
					A.ID_USUARIO id
					,A.NOME nome
					,A.EMAIL email
				FROM
					USUARIO A (NOLOCK)
					INNER JOIN TIPO B (NOLOCK)
						ON (A.ID_TIPO = B.ID_TIPO)
				WHERE
					A.ID_USUARIO = @id;

				SELECT
					B.ID_PERFIL id
					,B.PERFIL nome
				FROM
					PERFIL_USUARIO A (NOLOCK)
					INNER JOIN PERFIL B (NOLOCK)
						ON (A.ID_PERFIL = B.ID_PERFIL)
					INNER JOIN USUARIO C (NOLOCK)
						ON (A.ID_USUARIO = C.ID_USUARIO)
				WHERE
					C.ID_USUARIO = @id;
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	// Atualiza dados da sessao ativa, apenas se mesmo usuario
	if (sess[sessWraper] && sess[sessWraper].id === parseInt(idUsuario, 10)) {
		if (resultSet && resultSet.recordsets) {
			const rsLen = resultSet.recordsets.length;

			const dataUser = resultSet.recordsets[rsLen - 2].length === 1 && resultSet.recordsets[rsLen - 2].pop();

			const perfis = (
				resultSet.recordsets[rsLen - 1].length !== 0 && resultSet.recordsets[rsLen - 1].map(
					_p => {
						return _p.nome;
					}
				)
			) || [];

			const funcoes = (
				resultSet.recordsets[rsLen - 1].length !== 0 && resultSet.recordsets[rsLen - 1].map(
					_f => {
						return _f.id;
					}
				)
			) || [];

			sess[sessWraper] = { ...sess[sessWraper], ...dataUser, perfis: perfis, funcoes: funcoes };
		}
	}

	return resultSet.output;
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

	if (sess[sessWraper].id === parseInt(idUsuario, 10)) {
		errWrapper.throwThis('USUARIO', 400, 'Não é possível realizar esta operação em si mesmo...');
	}
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario]
			],
			output: [
				['id', 'int']
			],
			executar: `
				-- Exclui usuario
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

				SET @id = @idUsuario;
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	return resultSet.output;
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

	if (sess[sessWraper].id === parseInt(idUsuario, 10)) {
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
			output: [
				['id', 'int']
			],
			executar: `
				-- Usuario Ativo / Inativo
				UPDATE
					A
				SET
					A.ATIVO = @ativo
				FROM
					USUARIO A
				WHERE
					A.ID_USUARIO = @idUsuario;

				SET @id = @idUsuario;
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	return resultSet.output;
};

const options = async (req, res) => {
	const query = {
		formato: 1,
		dados: {
			executar: `
				-- Opcoes -> Tipos e Perfis disponiveis no DB
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
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	const optionsSet = {
		tipos: paginator.keysToCamelCase(resultSet.recordsets[0]), // Chaves para camelCase
		perfis: paginator.keysToCamelCase(resultSet.recordsets[1]) // Chaves para camelCase
	};

	const lEnumOptions = { ...enumOptions };

	// Mantem apenas a chave de conteudo
	Object.keys(enumOptions).forEach(
		key => {
			lEnumOptions[key] = enumOptions[key].content;
		}
	);

	return { ...optionsSet, ...lEnumOptions };
};
// -------------------------------------------------------------------------

module.exports = {
	consultarTodos,
	consultar,
	inserir,
	alterar,
	excluir,
	ativacao,
	options
};
