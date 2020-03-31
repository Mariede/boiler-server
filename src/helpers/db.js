'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const sql = require('mssql');
const mongoose = require('mongoose');
const mongooseSchemas = require('@serverRoot/models/mongooseSchemas');
const errWrapper = require('@serverRoot/helpers/errWrapper');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Conexao e execucao de queries no MS SQL Server
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
					.then (
						pool => {
							return new sql.Transaction(pool);
						}
					)
					.then (
						transaction => {
							return transaction.begin();
						}
					)
					.then (
						transaction => {
							resolve(transaction);
						}
					)
					.catch (
						err => {
							failReturn(err);
						}
					);
				} else {
				// DEFAULT - Conexao com pool
					new sql.ConnectionPool(__serverConfig.db.msSqlServer.configSql).connect()
					.then (
						pool => {
							return new sql.Transaction(pool);
						}
					)
					.then (
						transaction => {
							return transaction.begin();
						}
					)
					.then (
						transaction => {
							resolve(transaction);
						}
					)
					.catch (
						err => {
							failReturn(err);
						}
					);
				}
			} catch (err) {
				failReturn(err);
			}
		});
	},

	sqlExecute: (transaction, params) => { // Executa uma query ou stored procedure para uma transacao
		return new Promise((resolve, reject) => {
			const failReturn = err => {
				sql.close();
				reject(err);
			};

			try {
				const request = new sql.Request(transaction);

				const sqlAction = async (r, p) => {
					if (Object.prototype.hasOwnProperty.call(p, 'formato') && Object.prototype.hasOwnProperty.call(p, 'dados')) {
						if (Object.prototype.hasOwnProperty.call(p.dados, 'executar')) {
							const dataTypeCheck = _param => {
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

								let param = String(_param || ''),
									checkParamA = param.indexOf('('),
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
								if (Object.prototype.hasOwnProperty.call(p.dados, 'input')) {
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
								if (Object.prototype.hasOwnProperty.call(p.dados, 'output')) {
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

							switch (p.formato) {
								case 1: {
								// Query Simples
									return await r.query(p.dados.executar);
								}
								case 2: {
								// Stored Procedure
									return await r.execute(p.dados.executar);
								}
								default: {
									errWrapper.throwThis('DB', 400, 'Formato não foi corretamente definido nos parâmetros JSON para execução da query, ele contempla apenas os valores numéricos: 1 (Query simples) ou 2 (Stored Procedure)...');
								}
							}
						} else {
							errWrapper.throwThis('DB', 400, 'Executar não foi corretamente definido nos parâmetros JSON para execução da query, verifique seu código...');
						}
					} else {
						errWrapper.throwThis('DB', 400, 'O formato e/ou os dados não foram corretamente definidos nos parâmetros JSON para execução da query, verifique seu código...');
					}
				};

				sqlAction(request, params)
				.then (
					res => {
						resolve(res);
					}
				)
				.catch (
					err => {
						failReturn(err);
					}
				);
			} catch (err) {
				failReturn(err);
			}
		});
	},

	sqlCloseCon: (transaction, forceClose = false) => { // Commit na transacao (rollback automatico via config)
		return new Promise((resolve, reject) => {
			const failReturn = err => {
				sql.close();
				reject(err);
			};

			try {
				const sqlClose = p => {
					p.close();
				};

				transaction.commit()
				.then (
					() => {
						if (__serverConfig.db.msSqlServer.conexaoTipo === 2 || forceClose) {
						// Conexao simples, direta, sem pool
							sqlClose(sql);
						}
						resolve();
					}
				)
				.catch (
					err => {
						failReturn(err);
					}
				);
			} catch (err) {
				failReturn(err);
			}
		});
	},

	/*
	Detalhes:
		params => Seguem o formato json: { formato: , dados: { input: , output: , executar: } }

		* Verificar arquivo de ajuda
	*/
	sqlExecuteAll: async (params, forceClose = false) => { // Inicia uma transacao, executa e commita em uma unica chamada de metodo
		try {
			let transaction = await msSqlServer.sqlOpenCon(),
				result = await msSqlServer.sqlExecute(transaction, params);
				await msSqlServer.sqlCloseCon(transaction, forceClose);

			return result;
		} catch (err) {
			throw err;
		}
	}
};

const mongoDB = {
	noSqlOpenCon: () => { // Inicia uma conexao
		return new Promise((resolve, reject) => {
			try {
				// 0: disconnected, 1: connected, 2: connecting, 3: disconnecting, 4: invalid credentials
				const checkConnection = mongoose.connection.readyState;

				if (checkConnection === 1) {
					resolve();
				} else {
					const uri = __serverConfig.db.mongoose.connectionString;

					mongoose.connect(uri, __serverConfig.db.mongoose.configDb)
					.then (
						() => {
							resolve();
						}
					)
					.catch (
						err => {
							reject(err);
						}
					);
				}
			} catch (err) {
				reject(err);
			}
		});
	},

	/*
	Detalhes:
		schema => Nome do esquema a ser instaciado (definido em /models)
	*/
	noSqlGetModel: schema => {
		return new Promise((resolve, reject) => {
			try {
				const getCompoundIndexes = s => {
					try {
						return (mongooseSchemas.schemasCompoundIndexes[s] || []);
					} catch (err) {
						throw err;
					}
				};

				const getExtraOptions = s => {
					try {
						return (mongooseSchemas.schemasExtraOptions[s] || {});
					} catch (err) {
						throw err;
					}
				};

				let myModel = mongoose.models[schema];

				if (myModel) {
					resolve(myModel);
				} else {
					let checkedSchema = mongooseSchemas.schemas[schema];

					if (checkedSchema) {
						let options = Object.assign(__serverConfig.db.mongoose.configSchema, getExtraOptions(schema)),
							mySchema = new mongoose.Schema(checkedSchema, options),
							compoundIndexes = getCompoundIndexes(schema),
							verifiedCompoundIndexes = [];

						if (Array.isArray(compoundIndexes)) {
							verifiedCompoundIndexes = [...compoundIndexes];
						} else {
							verifiedCompoundIndexes.push(compoundIndexes);
						}

						verifiedCompoundIndexes.forEach (
							cVal => {
								if (typeof cVal === 'object') {
									if (Object.prototype.hasOwnProperty.call(cVal, '_unique')) {
										delete cVal._unique;
										mySchema.index(cVal, { unique: true });
									} else {
										mySchema.index(cVal);
									}
								}
							}
						);

						myModel = mongoose.model(schema, mySchema);

						myModel.syncIndexes()
						.then (
							() => {
								myModel.init();
							}
						)
						.then (
							() => {
								resolve(myModel);
							}
						)
						.catch (
							err => {
								reject(err);
							}
						);
					} else {
						reject('Esquema não encontrado...');
					}
				}
			} catch (err) {
				reject(err);
			}
		});
	},

	noSqlCloseCon: () => {
		try {
			mongoose.connection.close();
		} catch (err) {
			throw err;
		}
	},

	// Inicia uma transacao com o mongoose e retorna o id da sessao
	noSqlTransactionStart: () => {
		return new Promise((resolve, reject) => {
			try {
				mongoDB.noSqlOpenCon()
				.then (
					() => {
						return mongoose.startSession();
					}
				)
				.then (
					session => {
						session.startTransaction();
						resolve(session);
					}
				)
				.catch (
					err => {
						reject(err);
					}
				);
			} catch (err) {
				reject(err);
			}
		});
	},

	// Finaliza uma transacao com o mongoose
	noSqlTransactionCommit: session => {
		return new Promise((resolve, reject) => {
			try {
				session.commitTransaction()
				.then (
					() => {
						resolve();
					}
				)
				.catch (
					err => {
						reject(err);
					}
				);
			} catch (err) {
				reject(err);
			}
		});
	},

	/*
	Detalhes:
		search				=> Objeto que identifica o filtro da consulta ao model relacionado (via esquema)
		schema				=> Nome do esquema a ser instaciado (definido em /models)
		returnAlwaysArray	=> Metodo sempre retorna tipo array, independente da quantidade de elementos encontrados
			- padrao: 1 elemento retorna somento o objeto, > 1 retorna array de objetos, 0 retorna undefined
	*/
	noSqlGetIds: async (search, schema, session = undefined, returnAlwaysArray = false) => {
		try {
			let myModel = await mongoDB.noSqlExecute(schema),
				resultSearch = (session ? await myModel.find(search).select('_id').session(session) : await myModel.find(search).select('_id'));

			if (resultSearch.length === 0) {
				resultSearch = undefined;
			} else {
				if (!returnAlwaysArray && resultSearch.length === 1) {
					resultSearch = resultSearch[0];
				}
			}

			return resultSearch;
		} catch (err) {
			throw err;
		}
	},

	/*
	Detalhes:
		arrayData => Array com dados retornados

		* Padrao de retorno dos dados (base comparativa resultSet da lib MSSQL)
	*/
	noSqlFormattedResult: arrayData => {
		return new Promise((resolve, reject) => {
			try {
				let resultSet = {};

				if (Array.isArray(arrayData)) {
					resultSet.recordset = arrayData;
					resultSet.rowsAffected = [arrayData.length];
				}

				resolve(resultSet);
			} catch (err) {
				reject(err);
			}
		});
	},

	/*
	Detalhes:
		schema => Nome do esquema a ser instaciado (definido em /models)
	*/
	noSqlExecute: async schema => {
		try {
			await mongoDB.noSqlOpenCon();
			return await mongoDB.noSqlGetModel(schema);
		} catch (err) {
			throw err;
		}
	}
};
// -------------------------------------------------------------------------

module.exports = {
	msSqlServer,
	mongoDB
};
