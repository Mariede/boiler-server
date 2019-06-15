'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const sql = require('mssql');
const log = require('@serverRoot/helpers/log');
const errWrapper = require('@serverRoot/helpers/errWrapper');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Conexao e execucao de queries no MS SQL Server
// atraves do pacote mssql

// Inicia uma transacao
const sqlOpenCon = () => {
	return new Promise((resolve, reject) => {
		const failReturn = err => {
			sql.close();
			reject(err);
		};

		try {
			if (__serverConfig.db.conexaoTipo === 2) {
			// Conexao simples, direta, sem pool
				sql.connect(__serverConfig.db.configSql)
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
				new sql.ConnectionPool(__serverConfig.db.configSql).connect()
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
};

// Executa uma query ou stored procedure para uma transacao ja iniciada
const sqlExecute = (transaction, parametros) => {
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

			const sqlAction = (r, p) => {
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
							return r.query(p.dados.executar);
						} else if (p.formato === 2) {
						// Stored Procedure
							return r.execute(p.dados.executar);
						}
					} else {
						errWrapper.throwThis('DB', 400, 'Executar não foi corretamente definido nos parâmetros JSON para execução da query, verifique seu código...');
					}
				} else {
					errWrapper.throwThis('DB', 400, 'O formato e/ou os dados não foram corretamente definidos nos parâmetros JSON para execução da query, verifique seu código...');
				}
			};

			resolve(sqlAction(request, parametros));
		} catch(err) {
			failReturn(err);
		}
	});
};

// Commit ou rollback na transacao existente
const sqlCloseCon = (transaction, forceClose = false) => {
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
					if (__serverConfig.db.conexaoTipo === 2 || forceClose) {
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
};

// Inicia uma transacao, executa e commita em uma unica chamada de metodo
const sqlExecuteAll = async (parametros, forceClose = false) => {
	try {
		let transaction = await sqlOpenCon(),
			result = await sqlExecute(transaction, parametros);
			await sqlCloseCon(transaction, forceClose);

		return result;
	} catch(err) {
		throw err;
	}
};
// -------------------------------------------------------------------------

module.exports = {
	sqlOpenCon,
	sqlExecute,
	sqlCloseCon,
	sqlExecuteAll
};
