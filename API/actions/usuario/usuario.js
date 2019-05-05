"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao
const dbCon = require('@serverRoot/helpers/db');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const consultarTodos = async (req, res) => {
	try {
		let query1 = {
				formato: 1, // 1: Query String, 2: Stored Procedure
				dados: {
					input: [
						['NOME', 'varchar(200)', 'Joaquim Santos'],
						['SENHA', 'varchar(20)', 'SENH@TESTE123'],
						['ATIVO', 'bit', 1],
						['NOMECHECK', 'varchar(200)', '%Joa%']
					],
					output: [
						['INSERTED_ID', 'int']
					],
					executar: `
						SET NOCOUNT OFF;
						DECLARE
							@INCR int; -- variavel interna
						SET
							@INCR = (
								SELECT TOP 1
									ID_USUARIO
								FROM
									USUARIO U (NOLOCK)
								WHERE
									U.NOME LIKE(@NOMECHECK) -- variavel input externa
								ORDER BY
									ID_USUARIO DESC
						);
						INSERT INTO USUARIO (
							NOME
							,SENHA
							,ATIVO
						) VALUES (
							@NOME + ' ' + CAST(@INCR AS varchar) -- variavel input externa + interna
							,@SENHA -- variavel input externa
							,@ATIVO -- variavel input externa
						);
						SET
							@INSERTED_ID = SCOPE_IDENTITY(); -- variavel output
						SELECT TOP 2
							NOME
						FROM
							USUARIO U (NOLOCK)
						WHERE
							U.NOME LIKE(@NOMECHECK) -- variavel input externa
						ORDER BY
							ID_USUARIO DESC;
						SELECT TOP 3
							*
						FROM
							USUARIO U (NOLOCK)
						WHERE
							U.NOME LIKE(@NOMECHECK) -- variavel input externa
						ORDER BY
							ID_USUARIO DESC;
					`
				}
			},
			query2 = {
				formato: 2, // 1: Query String, 2: Stored Procedure
				dados: {
					input: [
						['ID_USUARIO', 'int', 1],
						['NOME', 'varchar(200)', 'joa']
					],
					output: [
						['QTD_RET', 'int']
					],
					executar: 'USUARIO_CONSULTAR'
				}
			};

		const paginator = require('@serverRoot/helpers/paginator');
		let result1 = await dbCon.sqlExecuteAll(query1);
		await paginator.setSorter(result1.recordsets[0], 'NOME', 'DESC') // sorter atua na propria array, referenciada. 'ASC' pode ser omitido (default)
		let pResult = await paginator.setPage(result1.recordsets[0], result1.rowsAffected[0], 3, 9); // paginado: pagina 3 / 9 itens por pagina

		return pResult;
	} catch(err) {
		throw new Error(err);
	}
};

const consultar = async (req, res) => {
	try {
		let fRet = 'consulta usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw new Error(err);
	}
};

const inserir = async (req, res) => {
	try {
		let fRet = 'insere usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw new Error(err);
	}
};

const alterar = async (req, res) => {
	try {
		let fRet = 'altera usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw new Error(err);
	}
};

const excluir = async (req, res) => {
	try {
		let fRet = 'exclui usuario',
			id = req.params.id;

		return `${fRet} ${id}`;
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

module.exports = {
	consultarTodos,
	consultar,
	inserir,
	alterar,
	excluir
};
