"use strict";

// -------------------------------------------------------------------------
// Modulos de inicializacao
const dbCon = require('@serverRoot/helpers/db');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Acoes
const consultarTodos = (req, res) => {
	return new Promise((resolve, reject) => {
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

			dbCon.sqlOpenCon()
			.then(
				async transaction => {
					try {
						let result1 = await dbCon.sqlExecute(transaction, query1);
						// let result1 = await dbCon.sqlExecute(transaction, query2);

						await dbCon.sqlCloseCon(transaction);
						resolve(result1);
					} catch(err) {
						reject(err);
					}
				}
			)
			.catch(
				err => {
					reject(err);
				}
			);
		} catch(err) {
			reject(err);
		}
	});
};

const consultar = (req, res) => {
	return new Promise((resolve, reject) => {
		try {
			let fRet = 'consulta usuario',
				id = req.params.id;

			resolve(`${fRet} ${id}`);
		} catch(err) {
			reject(err);
		}
	});
};

const inserir = (req, res) => {
	return new Promise((resolve, reject) => {
		try {
			let fRet = 'insere usuario',
				id = req.params.id;

			resolve(`${fRet} ${id}`);
		} catch(err) {
			reject(err);
		}
	});
};

const alterar = (req, res) => {
	return new Promise((resolve, reject) => {
		try {
			let fRet = 'altera usuario',
				id = req.params.id;

			resolve(`${fRet} ${id}`);
		} catch(err) {
			reject(err);
		}
	});
};

const excluir = (req, res) => {
	return new Promise((resolve, reject) => {
		try {
			let fRet = 'exclui usuario',
				id = req.params.id;

			resolve(`${fRet} ${id}`);
		} catch(err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	consultarTodos,
	consultar,
	inserir,
	alterar,
	excluir
};
