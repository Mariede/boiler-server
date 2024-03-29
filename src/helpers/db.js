'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const mongoose = require('mongoose');
const sql = require('mssql');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const errWrapper = require('@serverRoot/helpers/err-wrapper');
const mongooseSchemas = require('@serverRoot/lib-com/mongoose-schemas');
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
				if (__serverConfig.db.msSqlServer.connectionType === 2) {
				// Conexao simples, direta, sem pool
					sql.connect(__serverConfig.db.msSqlServer.configDb)
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
					new sql.ConnectionPool(__serverConfig.db.msSqlServer.configDb).connect()
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
								const validateE = _paramE => {
									return (
										_paramE ? (
											_paramE.split(',').map(
												element => {
													const iNum = parseFloat(element);
													return (isNaN(iNum) ? (element.trim().toUpperCase() === 'MAX' ? sql.MAX : element) : iNum);
												}
											)
										) : (
											_paramE
										)
									);
								};

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

								const param = String(_param || '');
								const checkParamA = param.indexOf('(');
								const checkParamB = checkParamA !== -1 ? checkParamA : param.length;
								const checkParamC = param.substr(0, checkParamB).trim();
								const checkParamD = dataTypesSupported.find(
									element => {
										return element.toUpperCase() === checkParamC.toUpperCase();
									}
								);
								const checkParamE = ((checkParamD && checkParamA !== -1) ? param.substr(checkParamA).replace(/[()]/g, '') : undefined);

								return { base: checkParamD, ext: validateE(checkParamE) };
							};

							const inputCheck = () => {
								if (Object.prototype.hasOwnProperty.call(p.dados, 'input')) {
									p.dados.input.forEach(key => {
										if (key.length === 3) {
											const dataType = dataTypeCheck(key[1]);

											if (dataType.base) {
												if (Array.isArray(dataType.ext)) {
													r.input(key[0], sql[dataType.base](...dataType.ext), key[2]);
												} else {
													r.input(key[0], sql[dataType.base], key[2]);
												}
											} else {
												errWrapper.throwThis('DB', 500, `Tipo de dados ${key[1]} definido no input da query não configurado no método, favor corrigir ou avise um administrador...`);
											}
										} else {
											if (key.length === 2) {
												r.input(key[0], key[1]);
											} else {
												errWrapper.throwThis('DB', 500, `Formato { ${key} } inválido para input da query, necessita de duas ou três chaves dependendo do modelo da chamada...`);
											}
										}
									});
								}
							};

							const outputCheck = () => {
								if (Object.prototype.hasOwnProperty.call(p.dados, 'output')) {
									p.dados.output.forEach(key => {
										if (key.length === 2) {
											const dataType = dataTypeCheck(key[1]);

											if (dataType.base) {
												if (Array.isArray(dataType.ext)) {
													r.output(key[0], sql[dataType.base](...dataType.ext));
												} else {
													r.output(key[0], sql[dataType.base]);
												}
											} else {
												errWrapper.throwThis('DB', 500, `Tipo de dados ${key[1]} definido no output da query não configurado no método, favor corrigir ou avise um administrador...`);
											}
										} else {
											errWrapper.throwThis('DB', 500, `Formato { ${key} } inválido para output da query, necessita de duas chaves...`);
										}
									});
								}
							};

							inputCheck();
							outputCheck();

							const isStream = __serverConfig.db.msSqlServer.configDb.stream === true;

							switch (p.formato) {
								case 1: {
								// Query Simples
									if (!isStream) {
										return await r.query(p.dados.executar);
									}

									r.query(p.dados.executar);
									return -1;
								}
								case 2: {
								// Stored Procedure
									if (!isStream) {
										return await r.execute(p.dados.executar);
									}

									r.execute(p.dados.executar);
									return -1;
								}
								default: {
									errWrapper.throwThis('DB', 500, 'Formato não foi corretamente definido nos parâmetros JSON para execução da query, ele contempla apenas os valores numéricos: 1 (Queries locais) ou 2 (Stored Procedure)...');
								}
							}
						} else {
							errWrapper.throwThis('DB', 500, 'A propriedade executar não foi corretamente definida nos parâmetros JSON para execução da query, verifique seu código...');
						}
					} else {
						errWrapper.throwThis('DB', 500, 'O formato e/ou os dados não foram corretamente definidos nos parâmetros JSON para execução da query, verifique seu código...');
					}
				};

				sqlAction(request, params)
				.then(
					res => {
						const sqlFormattedResult = result => {
							const formattedResult = {};

							if (result.rowsAffected.length === 1 && result.recordsets.length === 1) {
								formattedResult.recordset = result.recordsets[0];
								formattedResult.rowsAffected = result.rowsAffected[0];
							} else {
								formattedResult.recordsets = result.recordsets;
								formattedResult.rowsAffected = result.rowsAffected;
							}

							// Output values, se existirem
							if (typeof result.output === 'object' && Object.keys(result.output).length) {
								formattedResult.output = result.output;
							}

							// Return value, se existir
							if (result.returnValue) {
								formattedResult.returnValue = result.returnValue;
							}

							return formattedResult;
						};

						if (res !== -1) {
							resolve(
								sqlFormattedResult(res)
							);
						} else { // Stream
							const streamingAll = [];

							request.on(
								'error',
								err => {
									failReturn(err);
								}
							);

							request.on(
								'row',
								row => {
									streamingAll.push(row);
								}
							);

							request.on(
								'done',
								done => {
									const streamSplitted = [];

									const streamSplit = (
										Array.isArray(done.rowsAffected) ? (
											done.rowsAffected
										) : (
											[streamingAll.length]
										)
									);

									let streamPick = 0;

									streamSplit.forEach(
										blockSplit => {
											const nextPick = streamPick + blockSplit;
											const blockCurrent = streamingAll.slice(streamPick, nextPick);

											streamSplitted.push(blockCurrent);
											streamPick = nextPick;
										}
									);

									done.recordsets = streamSplitted;

									resolve(
										sqlFormattedResult(done)
									);
								}
							);
						}
					}
				)
				.catch(
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
				transaction.commit()
				.then(
					() => {
						if (__serverConfig.db.msSqlServer.connectionType === 2 || forceClose) {
						// Conexao simples, direta, sem pool
							sql.close();
						}

						resolve();
					}
				)
				.catch(
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
		const transaction = await msSqlServer.sqlOpenCon();
		const result = await msSqlServer.sqlExecute(transaction, params);

		await msSqlServer.sqlCloseCon(transaction, forceClose);

		return result;
	},

	/*
	Espera uma array de valores ou valor unico em param
		-> Limpa cada valor da array ou valor unico, validando caracteres perigosos (sanitize)
			-> Retorna String protegida ou o valor existente sem modificacao (se diferente de String)
	*/
	sanitize: param => {
		const sanitizeThis = _param => {
			if (typeof _param === 'string') {
				return _param.replace(
					/[\0\x08\x09\x1a\n\r"'\\%]/g, // eslint-disable-line no-control-regex
					char => {
						switch (char) {
							case '\0':
								return '\\0';
							case '\x08':
								return '\\b';
							case '\x09':
								return '\\t';
							case '\x1a':
								return '\\z';
							case '\n':
								return '\\n';
							case '\r':
								return '\\r';
							case '"':
								return '""';
							case '\'':
								return '\'\'';
							case '\\':
							case '%':
								return `\\${char}`;
							default:
								return char;
						}
					}
				);
			}

			if (!Array.isArray(_param)) {
				return _param;
			}

			return (
				_param.map(
					value => {
						return sanitizeThis(value);
					}
				)
			);
		};

		return sanitizeThis(param);
	}
};

const mongoDB = {
	noSqlOpenCon: () => { // Inicia uma conexao
		return new Promise((resolve, reject) => {
			// 0: disconnected, 1: connected, 2: connecting, 3: disconnecting, 4: invalid credentials
			const checkConnection = mongoose.connection.readyState;

			if (checkConnection === 1) {
				resolve();
			} else {
				const uri = __serverConfig.db.mongoose.connectionString;

				mongoose.connect(uri, __serverConfig.db.mongoose.configDb)
				.then(
					() => {
						resolve();
					}
				)
				.catch(
					err => {
						reject(err);
					}
				);
			}
		});
	},

	/*
	Detalhes:
		schema => Nome do esquema a ser instaciado (definido em /lib-com/mongoose-schemas)
	*/
	noSqlGetModel: schema => {
		return new Promise((resolve, reject) => {
			let myModel = mongoose.models[schema];

			if (myModel) {
				resolve(myModel);
			} else {
				const checkedSchema = mongooseSchemas.schemas[schema];

				if (checkedSchema) {
					const getCompoundIndexes = s => {
						return (mongooseSchemas.schemasCompoundIndexes[s] || []);
					};

					const getExtraOptions = s => {
						return (mongooseSchemas.schemasExtraOptions[s] || {});
					};

					const options = { ...__serverConfig.db.mongoose.configSchema, ...getExtraOptions(schema) };
					const mySchema = new mongoose.Schema(checkedSchema, options);
					const compoundIndexes = getCompoundIndexes(schema);
					const verifiedCompoundIndexes = [];

					if (Array.isArray(compoundIndexes)) {
						verifiedCompoundIndexes.push(...compoundIndexes);
					} else {
						verifiedCompoundIndexes.push(compoundIndexes);
					}

					verifiedCompoundIndexes.forEach(
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
					.then(
						() => {
							myModel.init();
						}
					)
					.then(
						() => {
							resolve(myModel);
						}
					)
					.catch(
						err => {
							reject(err);
						}
					);
				} else {
					reject(
						errWrapper.throwThis('DB', 500, 'Esquema não encontrado...')
					);
				}
			}
		});
	},

	noSqlCloseCon: () => {
		mongoose.connection.close();
	},

	// Inicia uma transacao com o mongoose e retorna o id da sessao
	noSqlTransactionStart: () => {
		return new Promise((resolve, reject) => {
			mongoDB.noSqlOpenCon()
			.then(
				() => {
					return mongoose.startSession();
				}
			)
			.then(
				session => {
					session.startTransaction();
					resolve(session);
				}
			)
			.catch(
				err => {
					reject(err);
				}
			);
		});
	},

	// Finaliza uma transacao com o mongoose
	noSqlTransactionCommit: session => {
		return new Promise((resolve, reject) => {
			session.commitTransaction()
			.then(
				() => {
					resolve();
				}
			)
			.catch(
				err => {
					reject(err);
				}
			);
		});
	},

	/*
	Detalhes:
		search				=> Objeto que identifica o filtro da consulta ao model relacionado (via esquema)
		schema				=> Nome do esquema a ser instaciado (definido em /lib-com/mongoose-schemas)
		returnAlwaysArray	=> Metodo sempre retorna tipo array, independente da quantidade de elementos encontrados
			- padrao: 1 elemento retorna somento o objeto, > 1 retorna array de objetos, 0 retorna undefined
	*/
	noSqlGetIds: async (search, schema, session = undefined, returnAlwaysArray = false) => {
		const myModel = await mongoDB.noSqlExecute(schema);

		let resultSearch = (session ? await myModel.find(search).select('_id').session(session) : await myModel.find(search).select('_id'));

		if (resultSearch.length === 0) {
			resultSearch = undefined;
		} else {
			if (!returnAlwaysArray && resultSearch.length === 1) {
				resultSearch = resultSearch[0];
			}
		}

		return resultSearch;
	},

	/*
	Detalhes:
		arrayData => Array com dados retornados

		* Padrao de retorno dos dados (base comparativa resultSet da lib MSSQL)
	*/
	noSqlFormattedResult: arrayData => {
		const resultSet = {};

		if (Array.isArray(arrayData)) {
			resultSet.recordset = arrayData;
			resultSet.rowsAffected = arrayData.length;
		}

		return resultSet;
	},

	/*
	Detalhes:
		schema => Nome do esquema a ser instaciado (definido em /lib-com/mongoose-schemas)
	*/
	noSqlExecute: async schema => {
		await mongoDB.noSqlOpenCon();
		return await mongoDB.noSqlGetModel(schema);
	}
};
// -------------------------------------------------------------------------

module.exports = {
	msSqlServer,
	mongoDB
};
