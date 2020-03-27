'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia a inspecao ciclica da pasta de e-mails para envio
const queueStartMailCheck = () => {
	return new Promise((resolve, reject) => {
		try {
			const transporter = nodemailer.createTransport(__serverConfig.email.transporter);
			const configQueue = __serverConfig.email.queue;
			const saveFullLogs = (configQueue.saveFullLogs ? 'mailQueue' : 'consoleOnly');
			const configKey = configQueue.path;
			const fileExtension = configQueue.fileExtension;
			const limitPerRound = configQueue.limitPerRound;
			const timeCheck = configQueue.timeCheck;
			const defaultLimitPerRound = 100;
			const defaultTimeCheck = 15000;
			const emailsPerRound = ((Number.isInteger(limitPerRound) && Number(limitPerRound) > 0 && Number(limitPerRound) <= defaultLimitPerRound) ? limitPerRound : defaultLimitPerRound);
			const intervalQueueCheck = ((Number.isInteger(timeCheck) && Number(timeCheck) >= defaultTimeCheck) ? timeCheck : defaultTimeCheck);

			let initPath = __serverRoot,
				queuePathSend = initPath + configKey;

			fs.access (
				queuePathSend,
				fs.constants.F_OK, // Check if exists
				err => {
					try {
						if (err) {
							configKey.replace(/[|&;$%@"<>()+,]/g, '').split(/[\\/]/).forEach(
								e => {
									initPath = path.join(initPath, e);

									if (!fs.existsSync(initPath)) {
										fs.mkdirSync(initPath);
									}
								}
							);
						}

						const watch = setInterval(
							() => {
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

											const asyncForEach = async (a, callback) => {
												for (let i = 0; i < a.length; i++) {
													let result = await callback(a[i], i, a);

													if (result) {
														break;
													}
												}
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

														await asyncForEach(
															targetFiles,
															async file => {
																try {
																	let filePathSending = await prepareThis(file),
																		fileContent = await readThis(filePathSending),
																		sentInfo = await transporter.sendMail(fileContent),
																		sentAccepted = (Array.isArray(sentInfo.accepted) ? sentInfo.accepted.length : 0),
																		sentRejected = (Array.isArray(sentInfo.rejected) ? sentInfo.rejected.length : 0),
																		sentPending = (Array.isArray(sentInfo.pending) ? sentInfo.pending.length : 0),
																		emailsAffected = sentAccepted + sentRejected + sentPending;

																	sentTotal = sentTotal + emailsAffected;

																	if (emailsAffected !== 0) {
																		await deleteThis(filePathSending);
																	}

																	log.logger('info', `E-mails disparados na fila - Aceitos: ${sentAccepted} | Rejeitados: ${sentRejected} | Pendentes: ${sentPending}${emailsAffected === 0 ? ' * Favor verificar a pasta sending (arquivo não excluído) *' : ''}`, 'mailQueue');

																	if (sentTotal < emailsPerRound) {
																		return false;
																	} else {
																		log.logger('info', `Fila de e-mails: limite de ${emailsPerRound} ${emailsPerRound === 1 ? 'e-mail atingido' : 'e-mails atingidos'} na rodada (${sentTotal} ${sentTotal === 1 ? 'disparado' : 'disparados'}), saindo do loop`, 'mailQueue');

																		return true;
																	}
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
							}, intervalQueueCheck
						);

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
