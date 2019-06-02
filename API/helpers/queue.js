'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const fs = require('fs');
const path = require('path');
const log = require('@serverRoot/helpers/log');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia a inspecao ciclica da pasta de e-mails para envio
const queueStartMailCheck = () => {
	return new Promise((resolve, reject) => {
		try {
			let configQueue = __serverConfig.email.queue,
				initPath = __serverRoot,
				configKey = configQueue.path,
				configKeySend = configKey + '/send',
				configKeySent = configKey + '/sent',
				queuePathSend = initPath + configKeySend,
				queuePathSent = initPath + configKeySent,
				timeCheck = configQueue.timeCheck,
				defaultTimeCheck = 15000,
				intervalQueueCheck = ((Number.isInteger(timeCheck) && Number(timeCheck) > defaultTimeCheck) ? timeCheck : defaultTimeCheck);

			const watch = setInterval(
				() => {
					fs.access(
						queuePathSend,
						fs.constants.F_OK, // check if exists
						err => {
							try {
								if (err) {
									log.logger('warn', `Não existe uma fila de e-mails para verificação: ${(err.message || err.stack || err)}`, 'consoleOnly');
								} else {
									fs.readdir(
										queuePathSend,
										'utf8',
										async (err, files) => {
											try {
												const readThis = f => {
													return new Promise((resolve, reject) => {
														try {
															fs.readFile(queuePathSend + '\\' + f,
															'utf8',
															(err, data) => {
																try {
																	if (err) {
																		reject(err);
																	} else {

																		/* testes */
																		// console.log(f);
																		/* testes */

																		resolve(JSON.parse(data));
																	}
																} catch(err) {
																	reject(err);
																}
															});
														} catch(err) {
															reject(err);
														}
													});
												};

												const asyncForEach = async (a, callback) => {
													for (let i = 0; i < a.length; i++) {
														await callback(a[i], i, a);
													}
												};

												if (err) {
													log.logger('warn', `Não foi possível ler o conteúdo da pasta ${queuePathSend}: ${(err.message || err.stack || err)}`, 'mailQueue');
												} else {
													if (files && files.length) {
														let extensao = configQueue.fileExtension,
															targetFiles = files.filter(
																file => {
																	return path.extname(file).toLowerCase() === extensao;
																}
															);

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
																		let fileContent = await readThis(file);

																		/* testes */
																		// Object.keys(fileContent).forEach(
																		// 	currentKey => {
																		// 		if (currentKey === 'to') {
																		// 			console.log(fileContent.to);
																		// 		} else if (currentKey === 'cc') {
																		// 			console.log(fileContent.cc);
																		// 		} else if (currentKey === 'bcc') {
																		// 			console.log(fileContent.bcc);
																		// 		}
																		// 	}
																		// );
																		/* testes */

																		// send email ****

																	} catch(err) {
																		log.logger('error', `Leitura de arquivo mal sucedida: ${(err.stack || err)}`, 'mailQueue');
																	}
																}
															);
														} else {
															log.logger('info', `Fila de e-mails verificada: nenhum arquivo na fila com a extensão ${extensao} procurada`, 'consoleOnly');
														}
													} else {
														log.logger('info', 'Fila de e-mails verificada: nenhum arquivo na fila', 'consoleOnly');
													}
												}
											} catch(err) {
												log.logger('error', `Leitura do diretório: ${(err.stack || err)}`, 'mailQueue');
											}
										}
									);
								}
							} catch(err) {
								log.logger('error', `Checagem do diretório: ${(err.stack || err)}`, 'mailQueue');
							}
						}
					);
				}
			, intervalQueueCheck);

			resolve(watch);
		} catch(err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	queueStartMailCheck
};
