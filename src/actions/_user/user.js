'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const cryptoHash = require('@serverRoot/helpers/crypto-hash');
const dbCon = require('@serverRoot/helpers/db');
const ejs = require('ejs');
const errWrapper = require('@serverRoot/helpers/err-wrapper');
const mailSender = require('@serverRoot/helpers/email');
const paginator = require('@serverRoot/helpers/paginator');
const searcher = require('@serverRoot/helpers/searcher');
const uploader = require('@serverRoot/helpers/uploader');
const validator = require('@serverRoot/helpers/validator');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
/*
Constantes gerais do modulo
*/

/*
Constantes locais
*/
const enumLocals = {
	passMinLen: 4,
	passMaxLen: 20,
	detailsMinLen: 5,
	detailsMaxLen: 8000
};

/*
Queries: Permissoes de Acesso
	-> Acoplado as queries do controller, filtrando a acao (where)
	-> Define o escopo de visualizacao
	-> Valida se usuario logado pode realizar a acao
*/
const addQueryCheckPermissions = `(
	@checkEmpresaProprietario = 1 OR (
		@checkEmpresaProprietario <> 1 AND A.ID_EMPRESA = @checkEmpresaId
	)
)`;

/*
Queries: Permissoes de Acesso
	-> Erro exibido, caso acao bloqueada ou nao executada
*/
const errorQueryCheckPermissions = 'Ação não executada, verifique as suas permissões de acesso ou contacte um administrador...';

/*
Colecoes enumeradas para a rota options
	-> utilizar key como 'OPTIONS.XXX' (para conversao json em paginator)
		-> ajuste automatico dos niveis json ao converter para camelCase em paginator, quando necessario
	-> na rota options a propriedade key nao e utilizada
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
// Funcoes compartilhadas

// Validacao comum para insert e update de usuarios
const _commonValidationErrStack = (nome, email, cpf, empresa, ativo, detalhes, perfis) => {
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

	if (validator.isEmpty(cpf)) {
		errorStack.push('CPF não pode ser vazio...');
	} else {
		if (!validator.isCpf(cpf)) {
			errorStack.push('CPF inválido...');
		}
	}

	if (validator.isEmpty(empresa)) {
		errorStack.push('Empresa não pode ser vazia...');
	} else {
		if (!validator.isInteger(empresa, false)) {
			errorStack.push('Empresa inválida...');
		}
	}

	if (validator.isEmpty(ativo, true, false)) { // Nao considera false vazio
		errorStack.push('Estado não pode ser vazio...');
	} else {
		if (!validator.isBoolean(ativo)) {
			errorStack.push('Estado inválido...');
		}
	}

	if (!validator.isEmpty(detalhes)) {
		if (!validator.lenRange(detalhes, enumLocals.detailsMinLen, enumLocals.detailsMaxLen)) {
			errorStack.push(`Detalhes deve conter entre ${enumLocals.detailsMinLen} e ${enumLocals.detailsMaxLen} caracteres...`);
		}
	}

	if (validator.isEmpty(perfis)) {
		errorStack.push('Perfis não pode ser vazio...');
	}

	if (errorStack.length !== 0) {
		errWrapper.throwThis('USUARIO', 400, errorStack);
	}
};

// Upload de arquivos para insert e update de usuarios
const _upload = async (req, res) => {
	const uploaderResults = await uploader.push(req, res, 'fileContent', 'files');
	return uploaderResults;
};
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes

// ------------------------------->>> Acao
// Consulta todos os usuarios
const consultarTodos = async (req, res) => {
	// Parametros de sessao
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;
	// -------------------------------------------------------------------------

	const replaceQuery = '{{REPLACE}}';
	const baseQuery = `
		-- Dados dos usuario (via searcher)
		SELECT DISTINCT
			A.ID_USUARIO
			,A.NOME
			,A.EMAIL
			,A.CPF
			,A.ATIVO
			,A.DETALHES
			,A.DATA_CRIACAO
			,A.ID_EMPRESA [EMPRESA.ID]
			,B.EMPRESA [EMPRESA.NOME]
			,B.ATIVO [EMPRESA.ATIVO]
			,(
				SELECT
					D.ID_PERFIL [ID]
					,D.PERFIL [NOME]
				FROM
					nodetest.PERFIL_USUARIO C (NOLOCK)
					INNER JOIN nodetest.PERFIL D (NOLOCK)
						ON C.ID_PERFIL = D.ID_PERFIL
				WHERE
					A.ID_USUARIO = C.ID_USUARIO
				FOR XML PATH ('PERFIL'), ROOT('PERFIS')
			) [PERFIS]
		FROM
			nodetest.USUARIO A (NOLOCK)
			INNER JOIN nodetest.EMPRESA B (NOLOCK)
				ON (A.ID_EMPRESA = B.ID_EMPRESA)
			INNER JOIN nodetest.PERFIL_USUARIO C (NOLOCK)
				ON (A.ID_USUARIO = C.ID_USUARIO)
			INNER JOIN nodetest.PERFIL D (NOLOCK)
				ON (C.ID_PERFIL = D.ID_PERFIL)
		WHERE
			${
				addQueryCheckPermissions
				.replace(/@checkEmpresaId/g, sess[sessWraper].empresa[0])
				.replace(/@checkEmpresaProprietario/g, (sess[sessWraper].empresa[2] & 1))
			}
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

// ------------------------------->>> Acao
// Consulta usuario por ID especifico, retorna tambem as opcoes disponiveis
const consultar = async (req, res) => {
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
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario],
				['checkEmpresaId', 'int', sess[sessWraper].empresa[0]],
				['checkEmpresaProprietario', 'int', sess[sessWraper].empresa[2]]
			],
			executar: `
				-- Dados do usuario
				SELECT
					A.ID_USUARIO
					,A.NOME
					,A.EMAIL
					,A.CPF
					,A.ATIVO
					,A.DETALHES
					,A.DATA_CRIACAO
					,A.ID_EMPRESA [EMPRESA.ID]
					,B.EMPRESA [EMPRESA.NOME]
					,B.ATIVO [EMPRESA.ATIVO]
					,(
						SELECT
							D.ID_PERFIL [ID]
							,D.PERFIL [NOME]
						FROM
							nodetest.PERFIL_USUARIO C (NOLOCK)
							INNER JOIN nodetest.PERFIL D (NOLOCK)
								ON C.ID_PERFIL = D.ID_PERFIL
						WHERE
							A.ID_USUARIO = C.ID_USUARIO
						FOR XML PATH ('PERFIL'), ROOT('PERFIS')
					) [PERFIS]
				FROM
					nodetest.USUARIO A (NOLOCK)
					INNER JOIN nodetest.EMPRESA B (NOLOCK)
						ON (A.ID_EMPRESA = B.ID_EMPRESA)
				WHERE
					A.ID_USUARIO = @idUsuario
					AND ${addQueryCheckPermissions};
				-- ----------------------------------------

				-- Retorna opcoes na mesma chamada, no mesmo json de retorno

				-- Empresas (opcoes)
				SELECT
					A.ID_EMPRESA [ID]
					,A.EMPRESA [NOME]
					,A.ATIVO
				FROM
					nodetest.EMPRESA A (NOLOCK)
				WHERE ${addQueryCheckPermissions}
				ORDER BY
					A.EMPRESA;

				-- Perfis (opcoes)
				SELECT
					A.ID_PERFIL [ID]
					,A.PERFIL [NOME]
				FROM
					nodetest.PERFIL A (NOLOCK)
				ORDER BY
					A.PERFIL;
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
				key: 'OPTIONS.EMPRESAS',
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

// ------------------------------->>> Acao
// Insere um novo usuario, envia e-mail com dados de acesso
const inserir = async (req, res) => {
	// Parametros de sessao
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;
	// -------------------------------------------------------------------------

	// Parametros de entrada

	// Uploads, trocar req.body para result.body
	const uResult = await _upload(req, res);

	const nome = uResult.body.nome;
	const email = uResult.body.email;
	const cpf = String(uResult.body.cpf).replace(/\D/g, ''); // Mascara no formulario
	const ativo = uResult.body.ativo;
	const detalhes = uResult.body.detalhes;
	const empresa = uResult.body.empresa;
	const perfis = dbCon.msSqlServer.sanitize(uResult.body.perfis);

	// Senha inicial
	const senha = cryptoHash.generateSalt(4, false); // Usando a funcao de salt para gerar uma senha randomica
	const salt = cryptoHash.generateSalt(5, false);
	// -------------------------------------------------------------------------

	// Validacoes entrada
	// Stack de erros
	_commonValidationErrStack(nome, email, cpf, empresa, ativo, detalhes, perfis);
	// -------------------------------------------------------------------------

	// Alteracoes comuns nos parametros de entrada
	const _nome = String(nome || '').toUpperCase();
	const _email = String(email || '').toLowerCase();
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['nome', 'varchar(200)', _nome],
				['email', 'varchar(200)', _email],
				['cpf', 'numeric(11, 0)', (cpf ? Number(cpf) : null)],
				['senha', 'varchar(128)', cryptoHash.hash(senha, salt).passHash],
				['salt', 'varchar(5)', salt],
				['ativo', 'bit', ativo],
				['detalhes', 'varchar(max)', detalhes || null],
				['empresa', 'int', empresa],
				['checkEmpresaId', 'int', sess[sessWraper].empresa[0]],
				['checkEmpresaProprietario', 'int', sess[sessWraper].empresa[2]]
			],
			output: [
				['rowCount', 'int'],
				['id', 'int']
			],
			executar: `
				-- Cria novo usuario

				SET @rowCount = (
					SELECT
						COUNT(*)
					FROM
						nodetest.EMPRESA A
					WHERE
						A.ID_EMPRESA = @empresa
						AND ${addQueryCheckPermissions}
				);

				IF (@rowCount <> 0)
				BEGIN
					INSERT INTO nodetest.USUARIO(
						ID_EMPRESA
						,NOME
						,EMAIL
						,CPF
						,SENHA
						,SALT
						,ATIVO
						,DETALHES
						,DATA_CRIACAO
					)
					VALUES(
						@empresa
						,@nome
						,@email
						,@cpf
						,@senha
						,@salt
						,@ativo
						,@detalhes
						,GETDATE()
					);

					SET @rowCount = @@ROWCOUNT;

					SET @id = SCOPE_IDENTITY();

					-- Perfis do usuario
					IF (@rowCount <> 0)
					BEGIN
						DELETE
							A
						FROM
							nodetest.PERFIL_USUARIO A
						WHERE
							A.ID_USUARIO = @id;

						INSERT INTO nodetest.PERFIL_USUARIO(
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
					END
				END
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	if (resultSet.output.rowCount === 0) {
		errWrapper.throwThis('USUARIO', 400, errorQueryCheckPermissions);
	}

	// Envia login e senha para o e-mail cadastrado
	const mailTemplate = `${__serverRoot}/views/server-side/pages/_mail-templates/user-new.ejs`;
	const dataTemplate = await ejs.renderFile(mailTemplate, { nome: _nome, email: _email, senha: senha });
	const mailSendQueue = __serverConfig.email.queue.on === true;

	const mailSenderResult = await mailSender.sendEmail(
		[
			__serverConfig.email.transporter.auth.user,
			__serverConfig.email.fromName
		],
		[
			[
				_email,
				_nome
			]
		],
		[],
		[],
		'Seu novo usuário',
		dataTemplate,
		[],
		{},
		true,
		mailSendQueue
	);

	const mailSent = (
		(Array.isArray(mailSenderResult) && mailSenderResult.length !== 0) ? (
			{
				envelope : mailSenderResult[0].envelope,
				error: mailSenderResult[0].error,
				toQueue: mailSenderResult[0].toQueue
			}
		) : (
			mailSenderResult
		)
	);

	return { ...resultSet.output, mailSent: { ...mailSent } };
};

// ------------------------------->>> Acao
// Altera dados de um usuario existente, atualiza dados da sessao se for o proprio usuario logado
const alterar = async (req, res) => {
	// Parametros de sessao
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;
	// -------------------------------------------------------------------------

	// Parametros de entrada
	const idUsuario = req.params.id;

	// Uploads, trocar req.body para result.body
	const uResult = await _upload(req, res);

	const nome = uResult.body.nome;
	const email = uResult.body.email;
	const cpf = String(uResult.body.cpf).replace(/\D/g, ''); // Mascara no formulario
	const ativo = uResult.body.ativo;
	const detalhes = uResult.body.detalhes;
	const empresa = uResult.body.empresa;
	const perfis = dbCon.msSqlServer.sanitize(uResult.body.perfis);
	// -------------------------------------------------------------------------

	// Validacoes entrada
	if (!validator.isInteger(idUsuario, false)) {
		errWrapper.throwThis('USUARIO', 400, 'ID do usuário deve ser numérico...');
	}

	if (sess[sessWraper].id === parseInt(idUsuario, 10) && !ativo) {
		errWrapper.throwThis('USUARIO', 400, 'Não é possível desativar a si mesmo...');
	}

	// Stack de erros
	_commonValidationErrStack(nome, email, cpf, empresa, ativo, detalhes, perfis);
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario],
				['nome', 'varchar(200)', String(nome || '').toUpperCase()],
				['email', 'varchar(200)', String(email || '').toLowerCase()],
				['cpf', 'numeric(11, 0)', (cpf ? Number(cpf) : null)],
				['ativo', 'bit', ativo],
				['detalhes', 'varchar(max)', detalhes || null],
				['empresa', 'int', empresa],
				['checkEmpresaId', 'int', sess[sessWraper].empresa[0]],
				['checkEmpresaProprietario', 'int', sess[sessWraper].empresa[2]]
			],
			output: [
				['rowCount', 'int'],
				['id', 'int']
			],
			executar: `
				-- Atualiza usuario

				SET @rowCount = (
					SELECT
						COUNT(*)
					FROM
						nodetest.EMPRESA A
					WHERE
						A.ID_EMPRESA = @empresa
						AND ${addQueryCheckPermissions}
				);

				IF (@rowCount <> 0)
				BEGIN
					UPDATE
						A
					SET
						A.ID_EMPRESA = @empresa
						,A.NOME = @nome
						,A.EMAIL = @email
						,A.CPF = @cpf
						,A.ATIVO = @ativo
						,A.DETALHES = @detalhes
					FROM
						nodetest.USUARIO A
					WHERE
						A.ID_USUARIO = @idUsuario
						AND ${addQueryCheckPermissions};

					SET @rowCount = @@ROWCOUNT;

					SET @id = @idUsuario;

					-- Perfis do usuario
					IF (@rowCount <> 0)
					BEGIN
						DELETE
							A
						FROM
							nodetest.PERFIL_USUARIO A
						WHERE
							A.ID_USUARIO = @id;

						INSERT INTO nodetest.PERFIL_USUARIO(
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

						-- Se dados alterados forem do usuario logado, atualiza a sessao
						SELECT
							A.ID_USUARIO id
							,A.NOME nome
							,A.EMAIL email
							,B.ID_EMPRESA empresaId
							,B.EMPRESA empresaNome
							,B.PROPRIETARIO empresaProprietario
						FROM
							nodetest.USUARIO A (NOLOCK)
							INNER JOIN nodetest.EMPRESA B (NOLOCK)
								ON (A.ID_EMPRESA = B.ID_EMPRESA)
						WHERE
							A.ID_USUARIO = @id;

						-- Perfis
						SELECT
							C.PERFIL _perfis
						FROM
							nodetest.USUARIO A (NOLOCK)
							INNER JOIN nodetest.PERFIL_USUARIO B (NOLOCK)
								ON (A.ID_USUARIO = B.ID_USUARIO)
							INNER JOIN nodetest.PERFIL C (NOLOCK)
								ON (B.ID_PERFIL = C.ID_PERFIL)
						WHERE
							A.ID_USUARIO = @id;

						-- Funcoes
						SELECT DISTINCT
							D.FUNCAO _funcoes
						FROM
							nodetest.USUARIO A (NOLOCK)
							INNER JOIN nodetest.PERFIL_USUARIO B (NOLOCK)
								ON (A.ID_USUARIO = B.ID_USUARIO)
							INNER JOIN nodetest.PERFIL_FUNCAO C (NOLOCK)
								ON (B.ID_PERFIL = C.ID_PERFIL)
							INNER JOIN nodetest.FUNCAO D (NOLOCK)
								ON (C.ID_FUNCAO = D.ID_FUNCAO)
						WHERE
							A.ID_USUARIO = @id;
						-- ----------------------------------------
					END
				END
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	if (resultSet.output.rowCount === 0) {
		errWrapper.throwThis('USUARIO', 400, errorQueryCheckPermissions);
	}

	// Atualiza dados da sessao ativa, APENAS se mesmo usuario
	if (sess[sessWraper] && sess[sessWraper].id === parseInt(idUsuario, 10)) {
		if (resultSet && resultSet.recordsets) {
			const rsLen = resultSet.recordsets.length;

			const dataUser = resultSet.recordsets[rsLen - 3].length === 1 && resultSet.recordsets[rsLen - 3].pop();

			const sessData = dataUser ? (
				{
					id: dataUser.id,
					nome: dataUser.nome,
					email: dataUser.email,
					empresa: [
						dataUser.empresaId,
						dataUser.empresaNome,
						dataUser.empresaProprietario
					]
				}
			) : (
				{}
			);

			const perfis = (
				resultSet.recordsets[rsLen - 2].length !== 0 && resultSet.recordsets[rsLen - 2].map(
					_p => {
						return _p._perfis;
					}
				)
			) || [];

			const funcoes = (
				resultSet.recordsets[rsLen - 1].length !== 0 && resultSet.recordsets[rsLen - 1].map(
					_f => {
						return _f._funcoes;
					}
				)
			) || [];

			sess[sessWraper] = { ...sess[sessWraper], ...sessData, perfis: perfis, funcoes: funcoes };
		}
	}

	return resultSet.output;
};

// ------------------------------->>> Acao
// Exclui um usuario existente
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

	if (sess[sessWraper].id === parseInt(idUsuario, 10)) { // Apenas outros usuarios
		errWrapper.throwThis('USUARIO', 400, 'Não é possível realizar esta operação em si mesmo...');
	}
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario],
				['checkEmpresaId', 'int', sess[sessWraper].empresa[0]],
				['checkEmpresaProprietario', 'int', sess[sessWraper].empresa[2]]
			],
			output: [
				['rowCount', 'int'],
				['id', 'int']
			],
			executar: `
				-- Exclui usuario
				DELETE
					B
				FROM
					nodetest.USUARIO A
					INNER JOIN nodetest.PERFIL_USUARIO B
						ON (A.ID_USUARIO = B.ID_USUARIO)
				WHERE
					A.ID_USUARIO = @idUsuario
					AND ${addQueryCheckPermissions};

				DELETE
					A
				FROM
					nodetest.USUARIO A
				WHERE
					A.ID_USUARIO = @idUsuario
					AND ${addQueryCheckPermissions};

				SET @rowCount = @@ROWCOUNT;

				SET @id = @idUsuario;
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	if (resultSet.output.rowCount === 0) {
		errWrapper.throwThis('USUARIO', 400, errorQueryCheckPermissions);
	}

	return resultSet.output;
};

// ------------------------------->>> Acao
// Ativa ou inativa um usuario existente
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

	if (sess[sessWraper].id === parseInt(idUsuario, 10)) { // Apenas outros usuarios
		errWrapper.throwThis('USUARIO', 400, 'Não é possível realizar esta operação em si mesmo...');
	}
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario],
				['ativo', 'bit', !ativo],
				['checkEmpresaId', 'int', sess[sessWraper].empresa[0]],
				['checkEmpresaProprietario', 'int', sess[sessWraper].empresa[2]]
			],
			output: [
				['rowCount', 'int'],
				['id', 'int']
			],
			executar: `
				-- Usuario Ativo / Inativo
				UPDATE
					A
				SET
					A.ATIVO = @ativo
				FROM
					nodetest.USUARIO A
				WHERE
					A.ID_USUARIO = @idUsuario
					AND ${addQueryCheckPermissions};

				SET @rowCount = @@ROWCOUNT;

				SET @id = @idUsuario;
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	if (resultSet.output.rowCount === 0) {
		errWrapper.throwThis('USUARIO', 400, errorQueryCheckPermissions);
	}

	return resultSet.output;
};

// ------------------------------->>> Acao
// Altera a senha do usuario logado
const senha = async (req, res) => {
	// Parametros de sessao
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;
	// -------------------------------------------------------------------------

	// Parametros de entrada
	const idUsuario = req.params.id;
	const senha = req.body.senha;
	const senhaNova = req.body.senhaNova;
	const senhaNovaCheck = req.body.senhaNovaCheck;
	// -------------------------------------------------------------------------

	// Validacoes entrada
	if (!validator.isInteger(idUsuario, false)) {
		errWrapper.throwThis('USUARIO', 400, 'ID do usuário deve ser numérico...');
	}

	if (sess[sessWraper].id !== parseInt(idUsuario, 10)) { // Apenas em si mesmo
		errWrapper.throwThis('USUARIO', 400, 'Só é possível realizar esta operação em si mesmo...');
	}

	const errorStack = [];

	if (validator.isEmpty(senha)) {
		errorStack.push('Senha atual não pode ser vazia...');
	}

	if (validator.isEmpty(senhaNova)) {
		errorStack.push('Nova senha não pode ser vazia...');
	} else {
		if (!validator.lenRange(senhaNova, enumLocals.passMinLen, enumLocals.passMaxLen)) {
			errorStack.push(`Nova senha deve conter entre ${enumLocals.passMinLen} e ${enumLocals.passMaxLen} caracteres...`);
		} else {
			if (validator.equal(senhaNova, senha)) {
				errorStack.push('Nova senha não pode ser igual a atual...');
			}
		}
	}

	if (validator.isEmpty(senhaNovaCheck)) {
		errorStack.push('Confirmação de nova senha não pode ser vazia...');
	} else {
		if (!validator.equal(senhaNovaCheck, senhaNova)) {
			errorStack.push('Confirmação de nova senha não confere...');
		}
	}

	if (errorStack.length !== 0) {
		errWrapper.throwThis('USUARIO', 400, errorStack);
	} else {
		const query = {
			formato: 1,
			dados: {
				input: [
					['idUsuario', 'int', idUsuario]
				],
				executar: `
					-- Valida dados do usuario
					SELECT
						A.SENHA
						,A.SALT
						,A.ATIVO
					FROM
						nodetest.USUARIO A (NOLOCK)
					WHERE
						A.ID_USUARIO = @idUsuario;
					-- ----------------------------------------
				`
			}
		};

		const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);
		const dataUser = resultSet && resultSet.rowsAffected === 1 && resultSet.recordset.pop();
		const senhaCheck = (dataUser ? cryptoHash.hash(senha, dataUser.SALT) : null);

		if (!senhaCheck) {
			errWrapper.throwThis('USUARIO', 400, 'Erro ao recuperar dados do usuário...');
		} else {
			if (senhaCheck.passHash !== dataUser.SENHA) {
				errWrapper.throwThis('USUARIO', 400, 'Senha informada é inválida...');
			}
		}

		if (!dataUser.ATIVO) {
			errWrapper.throwThis('USUARIO', 400, 'Usuário inativo...');
		}
	}
	// -------------------------------------------------------------------------

	const salt = cryptoHash.generateSalt(5, false);

	const query = {
		formato: 1,
		dados: {
			input: [
				['idUsuario', 'int', idUsuario],
				['senha', 'varchar(128)', cryptoHash.hash(senhaNova, salt).passHash],
				['salt', 'varchar(5)', salt]
			],
			output: [
				['rowCount', 'int'],
				['id', 'int']
			],
			executar: `
				-- Altera senha do usuario
				UPDATE
					A
				SET
					A.SENHA = @senha
					,A.SALT = @salt
				FROM
					nodetest.USUARIO A
				WHERE
					A.ID_USUARIO = @idUsuario;

				SET @rowCount = @@ROWCOUNT;

				SET @id = @idUsuario;
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	if (resultSet.output.rowCount === 0) {
		errWrapper.throwThis('USUARIO', 400, errorQueryCheckPermissions);
	}

	return resultSet.output;
};

// ------------------------------->>> Acao
// Consulta as opcoes disponiveis
const options = async (req, res) => {
	// Parametros de sessao
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;
	// -------------------------------------------------------------------------

	const query = {
		formato: 1,
		dados: {
			input: [
				['checkEmpresaId', 'int', sess[sessWraper].empresa[0]],
				['checkEmpresaProprietario', 'int', sess[sessWraper].empresa[2]]
			],
			executar: `
				-- Opcoes -> Empresas disponiveis no DB
				SELECT
					A.ID_EMPRESA [ID]
					,A.EMPRESA [NOME]
					,A.ATIVO
				FROM
					nodetest.EMPRESA A (NOLOCK)
				WHERE ${addQueryCheckPermissions}
				ORDER BY
					A.EMPRESA;

				-- Opcoes -> Perfis disponiveis no DB
				SELECT
					A.ID_PERFIL [ID]
					,A.PERFIL [NOME]
				FROM
					nodetest.PERFIL A (NOLOCK)
				ORDER BY
					A.PERFIL;
				-- ----------------------------------------
			`
		}
	};

	const resultSet = await dbCon.msSqlServer.sqlExecuteAll(query);

	const optionsSet = {
		empresas: paginator.keysToCamelCase(resultSet.recordsets[0]), // Chaves para camelCase
		perfis: paginator.keysToCamelCase(resultSet.recordsets[1]) // Chaves para camelCase
	};

	const _enumOptions = {};

	// Mantem apenas a chave de conteudo
	Object.keys(enumOptions).forEach(
		key => {
			_enumOptions[key] = enumOptions[key].content;
		}
	);

	return { ...optionsSet, ..._enumOptions };
};
// -------------------------------------------------------------------------

module.exports = {
	consultarTodos,
	consultar,
	inserir,
	alterar,
	excluir,
	ativacao,
	senha,
	options
};
