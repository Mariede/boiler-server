'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const sql = require('mssql');
const errWrapper = require('@serverRoot/helpers/errWrapper');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Conexao e execucao de queries no MS SQL Server
// atraves do pacote mssql
const msSqlServer = {
	sqlOpenCon: () => { // Inicia uma transacao
		return new Promise((resolve, reject) => {
			const failReturn = err => {
				sql.close();
				reject(err);
			};

			try {
				if (__serverConfig.db.msSqlServer.conexaoTipo === 2) {
				// Conexao simples, direta, sem pool
					sql.connect(__serverConfig.db.msSqlServer.configSql)
					.then(
						pool => {
							return new sql.Transaction(pool);
						}
					)
					.then(
						transaction => {
							return transaction.begin();
						}
					)
					.then(
						transaction => {
							resolve(transaction);
						}
					)
					.catch(
						err => {
							failReturn(err);
						}
					);
				} else {
				// DEFAULT - Conexao com pool
					new sql.ConnectionPool(__serverConfig.db.msSqlServer.configSql).connect()
					.then(
						pool => {
							return new sql.Transaction(pool);
						}
					)
					.then(
						transaction => {
							return transaction.begin();
						}
					)
					.then(
						transaction => {
							resolve(transaction);
						}
					)
					.catch(
						err => {
							failReturn(err);
						}
					);
				}
			} catch(err) {
				failReturn(err);
			}
		});
	},
	sqlExecute: (transaction, parametros) => { // Executa uma query ou stored procedure para uma transacao ja iniciada
		return new Promise((resolve, reject) => {
			const failReturn = async err => {
				try {
					await transaction.rollback();
				} finally {
					sql.close();
					reject(err);
				}
			};

			try {
				const request = new sql.Request(transaction);

				const sqlAction = async (r, p) => {
					if (p.hasOwnProperty('formato') && p.hasOwnProperty('dados')) {
						if (p.dados.hasOwnProperty('executar')) {
							const dataTypeCheck = param => {
								const dataTypesSupported = [
									'Bit',
									'BigInt',
									'Decimal',
									'Float',
									'Int',
									'Money',
									'Numeric',
									'SmallInt',
									'SmallMoney',
									'Real',
									'TinyInt',
									'Char',
									'NChar',
									'Text',
									'NText',
									'VarChar',
									'NVarChar',
									'Xml',
									'Time',
									'Date',
									'DateTime',
									'DateTime2',
									'DateTimeOffset',
									'SmallDateTime',
									'UniqueIdentifier',
									'Variant',
									'Binary',
									'VarBinary',
									'Image',
									'UDT',
									'Geography',
									'Geometry'
								];

								param = (param || '').toString();

								let checkParamA = param.indexOf('('),
									checkParamB = checkParamA !== -1 ? checkParamA : param.length,
									checkParamC = param.substr(0, checkParamB).trim(),
									checkParamD = (dataTypesSupported.find(
										element => {
											return element.toUpperCase() === checkParamC.toUpperCase();
										}
									) || ''),
									checkParamE = ((checkParamD && checkParamA !== -1) ? param.substr(checkParamA).replace(/[()]/g, '') : '').split(',').map(
										i => {
											let iNum = parseFloat(i);
											return ((isNaN(i) || isNaN(iNum)) ? i : iNum);
										}
									);

								return { base: checkParamD, ext: checkParamE };
							};

							const inputCheck = (r, p) => {
								if (p.dados.hasOwnProperty('input')) {
									p.dados.input.forEach(key => {
										if (key.length === 3) {
											let dataType = dataTypeCheck(key[1]);
											if (dataType.base !== '') {
												if (dataType.ext !== '') {
													r.input(key[0], sql[dataType.base](...dataType.ext), key[2]);
												} else {
													r.input(key[0], sql[dataType.base], key[2]);
												}
											} else {
												errWrapper.throwThis('DB', 400, `Tipo de dados ${key[1]} definido no input de ${p.dados.executar} não configurado no método, favor corrigir ou avise um administrador...`);
											}
										} else {
											if (key.length === 2) {
												r.input(key[0], key[1]);
											} else {
												errWrapper.throwThis('DB', 400, `Formato { ${key} } inválido para input da query { ${p.dados.executar} }, necessita de duas ou três chaves, dependendo do modelo da chamada...`);
											}
										}
									});
								}
							};

							const outputCheck = (r, p) => {
								if (p.dados.hasOwnProperty('output')) {
									p.dados.output.forEach(key => {
										if (key.length === 2) {
											let dataType = dataTypeCheck(key[1]);
											if (dataType.base !== '') {
												if (dataType.ext !== '') {
													r.output(key[0], sql[dataType.base](...dataType.ext));
												} else {
													r.output(key[0], sql[dataType.base]);
												}
											} else {
												errWrapper.throwThis('DB', 400, `Tipo de dados ${key[1]} definido no output de ${p.dados.executar} não configurado no método, favor corrigir ou avise um administrador...`);
											}
										} else {
											errWrapper.throwThis('DB', 400, `Formato { ${key} } inválido para output da query { ${p.dados.executar} }, necessita de duas chaves...`);
										}
									});
								}
							};

							inputCheck(r, p);
							outputCheck(r, p);

							if (p.formato === 1) {
							// Query Simples
								return await r.query(p.dados.executar);
							} else if (p.formato === 2) {
							// Stored Procedure
								return await r.execute(p.dados.executar);
							}
						} else {
							errWrapper.throwThis('DB', 400, 'Executar não foi corretamente definido nos parâmetros JSON para execução da query, verifique seu código...');
						}
					} else {
						errWrapper.throwThis('DB', 400, 'O formato e/ou os dados não foram corretamente definidos nos parâmetros JSON para execução da query, verifique seu código...');
					}
				};

				sqlAction(request, parametros)
				.then(
					res => {
						resolve(res);
					}
				)
				.catch(
					err => {
						failReturn(err);
					}
				);
			} catch(err) {
				failReturn(err);
			}
		});
	},
	sqlCloseCon: (transaction, forceClose = false) => { // Commit ou rollback na transacao existente
		return new Promise((resolve, reject) => {
			const failReturn = async err => {
				try {
					await transaction.rollback();
				} finally {
					sql.close();
					reject(err);
				}
			};

			try {
				const sqlClose = p => {
					p.close();
				};

				transaction.commit()
				.then(
					() => {
						if (__serverConfig.db.msSqlServer.conexaoTipo === 2 || forceClose) {
						// Conexao simples, direta, sem pool
							sqlClose(sql);
						}
						resolve();
					}
				)
				.catch(
					err => {
						failReturn(err);
					}
				);
			} catch(err) {
				failReturn(err);
			}
		});
	},
	sqlExecuteAll: async (parametros, forceClose = false) => { // Inicia uma transacao, executa e commita em uma unica chamada de metodo
		try {
			let transaction = await msSqlServer.sqlOpenCon(),
				result = await msSqlServer.sqlExecute(transaction, parametros);
				await msSqlServer.sqlCloseCon(transaction, forceClose);

			return result;
		} catch(err) {
			throw err;
		}
	}
};
// -------------------------------------------------------------------------

module.exports = {
	msSqlServer
};
