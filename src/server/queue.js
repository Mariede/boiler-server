'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const functions = require('@serverRoot/helpers/functions');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia a inspecao ciclica da pasta de e-mails para envio
const queueStartMailCheck = () => {
	return new Promise((resolve, reject) => {
		try {
			const transporter = nodemailer.createTransport(__serverConfig.email.transporter);
			const configQueue = __serverConfig.email.queue;
			const saveFullLogs = (configQueue.saveFullLogs ? 'mailQueue' : 'consoleOnly');
			const configKey = configQueue.path + '\\trabalhador-' + (__serverWorker ? __serverWorker : 'unico');
			const fileExtension = configQueue.fileExtension;
			const limitPerRound = configQueue.limitPerRound;
			const timeCheck = configQueue.timeCheck;
			const timeFirstCheck = configQueue.timeFirstCheck;

			let initPath = __serverRoot,
				queuePathSend = initPath + configKey;

			// Validacoes dos parametros essenciais no config
			if (!Number.isInteger(limitPerRound) || limitPerRound <= 0) {
				throw new Error(`Serviço de fila de e-mails falhou ao iniciar: parâmetro limitPerRound em config é inválido: ${limitPerRound} - precisa ser numérico e maior que zero`);
			}

			if (!Number.isInteger(timeCheck) || timeCheck <= 5000) {
				throw new Error(`Serviço de fila de e-mails falhou ao iniciar: parâmetro timeCheck em config é inválido: ${timeCheck} - precisa ser numérico e maior que 5000`);
			}

			if (!Number.isInteger(timeFirstCheck) || timeFirstCheck <= 900) {
				throw new Error(`Serviço de fila de e-mails falhou ao iniciar: parâmetro timeFirstCheck em config é inválido: ${timeFirstCheck} - precisa ser numérico e maior que 900`);
			}

			fs.access (
				queuePathSend,
				fs.constants.F_OK, // Check if exists
				err => {
					try {
						if (err) {
							functions.removeInvalidFileNameChars(configKey).split(/[\\/]/).forEach(
								e => {
									initPath = path.join(initPath, e);

									if (!fs.existsSync(initPath)) {
										fs.mkdirSync(initPath);
									}
								}
							);
						}

						const queueMailCheck = () => {
							try {
								fs.readdir (
									queuePathSend,
									'utf8',
									async (err, files) => {
										try {
											const prepareThis = f => {
												return new Promise((resolve, reject) => {
													try {
														const moveThis = (fpSend, fpSending) => {
															return new Promise((resolve, reject) => {
																try {
																	fs.rename (
																		fpSend,
																		fpSending,
																		err => {
																			try {
																				if (err) {
																					reject(err);
																				} else {
																					resolve(fpSending);
																				}
																			} catch (err) {
																				reject(err);
																			}
																		}
																	);
																} catch (err) {
																	reject(err);
																}
															});
														};

														let queuePathSending = queuePathSend + '/sending',
															filePathSend = queuePathSend + '\\' + f,
															filePathSending = queuePathSending + '\\' + f;

														fs.access (
															queuePathSending,
															fs.constants.F_OK, // Check if exists
															err => {
																try {
																	if (err) {
																		fs.mkdir (
																			queuePathSending,
																			err => {
																				try {
																					if (err) {
																						reject(err);
																					} else {
																						moveThis(filePathSend, filePathSending)
																						.then (
																							result => {
																								resolve(result);
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
																			}
																		);
																	} else {
																		moveThis(filePathSend, filePathSending)
																		.then (
																			result => {
																				resolve(result);
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
															}
														);
													} catch (err) {
														reject(err);
													}
												});
											};

											const readThis = f => {
												return new Promise((resolve, reject) => {
													try {
														fs.readFile (
															f,
															'utf8',
															(err, data) => {
																try {
																	if (err) {
																		reject(err);
																	} else {
																		resolve(JSON.parse(data));
																	}
																} catch (err) {
																	reject(err);
																}
															}
														);
													} catch (err) {
														reject(err);
													}
												});
											};

											const deleteThis = f => {
												return new Promise((resolve, reject) => {
													try {
														fs.unlink (
															f,
															err => {
																try {
																	if (err) {
																		reject(err);
																	} else {
																		resolve();
																	}
																} catch (err) {
																	reject(err);
																}
															}
														);
													} catch (err) {
														reject(err);
													}
												});
											};

											if (err) {
												log.logger('error', `Não foi possível ler o conteúdo da pasta ${queuePathSend}: ${(err.message || err.stack || err)}`, 'mailQueue');
											} else {
												if (files && files.length) {
													let targetFiles = files.filter(
															file => {
																return path.extname(file).toLowerCase() === fileExtension;
															}
														),
														sentTotal = 0;

													if (targetFiles.length) {
														targetFiles.sort(
															(a, b) => {
																return (a > b ? 1 : (a < b ? -1 : 0));
															}
														);

														await functions.asyncForEach(
															targetFiles,
															async file => {
																try {
																	let filePathSending = await prepareThis(file),
																		fileContent = await readThis(filePathSending),
																		sentInfo = await transporter.sendMail(fileContent),
																		sentAccepted = (Array.isArray(sentInfo.accepted) ? sentInfo.accepted.length : 0),
																		sentRejected = (Array.isArray(sentInfo.rejected) ? sentInfo.rejected.length : 0),
																		sentPending = (Array.isArray(sentInfo.pending) ? sentInfo.pending.length : 0),
																		emailsAffected = sentAccepted + sentRejected + sentPending,
																		fRet = false;

																	sentTotal = sentTotal + emailsAffected;

																	if (emailsAffected !== 0) {
																		await deleteThis(filePathSending);
																	}

																	log.logger('info', `E-mails disparados na fila - Aceitos: ${sentAccepted} | Rejeitados: ${sentRejected} | Pendentes: ${sentPending}${emailsAffected === 0 ? ' * Favor verificar a pasta sending (arquivo não excluído) *' : ''}`, 'mailQueue');

																	if (sentTotal >= limitPerRound) {
																		fRet = true;

																		log.logger('info', `Fila de e-mails: limite de ${limitPerRound} ${limitPerRound === 1 ? 'e-mail atingido' : 'e-mails atingidos'} na rodada (${sentTotal} ${sentTotal === 1 ? 'disparado' : 'disparados'}), saindo do loop`, 'mailQueue');
																	}

																	return fRet;
																} catch (err) {
																	log.logger('error', `Disparo de arquivo mal sucedido: ${(err.stack || err)}`, 'mailQueue');
																}
															}
														);
													} else {
														log.logger('info', 'Fila de e-mails verificada: nenhum arquivo na fila', saveFullLogs);
													}
												} else {
													log.logger('info', 'Fila de e-mails verificada: nenhum arquivo na fila', saveFullLogs);
												}
											}
										} catch (err) {
											log.logger('error', `Leitura do diretório: ${(err.stack || err)}`, 'mailQueue');
										}
									}
								);
							} catch (err) {
								throw err;
							}
						};

						const watch = setTimeout(() => {
							queueMailCheck();

							setInterval(() => {
								queueMailCheck();
							}, timeCheck);
						}, (__serverWorker || 1) * timeFirstCheck);

						resolve(watch);
					} catch (err) {
						reject(err);
					}
				}
			);
		} catch (err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	queueStartMailCheck
};
