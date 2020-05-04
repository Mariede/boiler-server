'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const fs = require('fs');
const htmlToText = require('html-to-text');
const nodemailer = require('nodemailer');
const path = require('path');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const errWrapper = require('@serverRoot/helpers/err-wrapper');
const functions = require('@serverRoot/helpers/functions');
const validator = require('@serverRoot/helpers/validator');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Queue: E-mails como arquivos em uma fila para serem enviados posteriormente (metodo privado)
const _executeQueue = (e, counter) => {
	return new Promise((resolve, reject) => {
		const configQueue = __serverConfig.email.queue;
		const configKey = `${configQueue.path}/trabalhador-${(__serverWorker ? __serverWorker : 'unico')}`;
		const queueFile = JSON.stringify(e);
		const uniqueId = functions.generateUniqueId(3);

		let initPath = __serverRoot;

		const queuePathSend = initPath + configKey;
		const fileName = `${queuePathSend}/mail-queue-${uniqueId}.${counter + configQueue.fileExtension}`;

		fs.access(
			queuePathSend,
			fs.constants.F_OK, // Check if exists
			async err => {
				try {
					if (err) {
						await functions.promiseForEach(
							functions.removeInvalidFileNameChars(configKey).split(/[\\/]/),
							async folder => {
								try {
									initPath = path.join(initPath, folder);
									await functions.createNewFolder(fs, initPath);
								} catch (err) {
									reject(err);
								}
							}
						);
					}

					functions.writeFile(
						fs,
						fileName,
						queueFile
					)
					.then(
						() => {
							resolve(queueFile);
						}
					)
					.catch(
						err => {
							reject(err);
						}
					);
				} catch (err) {
					reject(err);
				}
			}
		);
	});
};

// Dados validados, e-mails serao enviados ou colocados na fila (metodo privado)
const _executeSend = async (from, to, cc, bcc, subject, text, attachments, sendChunks, sendQueue) => {
	const setChunks = (key, d, lastCall) => {
		const setMessages = value => {
			const msg = JSON.parse(JSON.stringify(message));

			msg[key] = value;
			messages.push(msg);
		};

		if (Object.entries(sendChunks).length !== 0) {
			if (sendChunks[key]) {
				for (let i = 0; i < d.length; i++) {
					if (i % sendChunks[key] === 0) {
						setMessages(d.slice(i, i + sendChunks[key]));
					}
				}
			} else {
				if (key === 'to' && sendChunks.inheritTo && !lastCall) {
					message.to = d;
				} else {
					setMessages(d);
				}
			}
		} else {
			if (!lastCall) {
				message[key] = d;
			} else {
				setMessages(d);
			}
		}
	};

	const sendAndReturn = async (m, t) => {
		const sentInfos = [];

		let i = 0;

		await functions.asyncForEach(
			m,
			async e => {
				i++;

				const envelope = {
					from: (Array.isArray(e.from) ? e.from[0] : e.from),
					to: (Array.isArray(e.to) ? [...e.to] : []),
					cc: (Array.isArray(e.cc) ? [...e.cc] : []),
					bcc: (Array.isArray(e.bcc) ? [...e.bcc] : [])
				};

				if (!sendQueue) {
					try {
						const sentInfo = await t.sendMail(e); // Envia chunk de e-mails
						sentInfos.push(
							{
								toQueue: false,
								envelope: envelope,
								data: sentInfo
							}
						);
					} catch (err) {
						sentInfos.push(
							{
								toQueue: false,
								envelope: envelope,
								error: err
							}
						);
					}
				} else {
					try {
						const sentInfo = await _executeQueue(e, i); // Enfileira chunk de e-mails
						sentInfos.push(
							{
								toQueue: true,
								envelope: envelope,
								data: sentInfo
							}
						);
					} catch (err) {
						sentInfos.push(
							{
								toQueue: true,
								envelope: envelope,
								error: err
							}
						);
					}
				}
			}
		);

		return sentInfos;
	};

	const transporter = nodemailer.createTransport(__serverConfig.email.transporter);

	const message = {
		from: from,
		subject: subject
	};

	const messages = [];

	// Testa se algum possivel elemento html no corpo
	if (/<[a-z][\s\S]*>/i.test(text)) {
		message.html = text;
		message.text = htmlToText.fromString(text, { wordwrap: 80, preserveNewlines: true });
	} else {
		message.text = text;
	}

	if (attachments.length !== 0) {
		message.attachments = attachments;
	}

	if (to.length !== 0) {
		setChunks('to', to, (to.length && !cc.length && !bcc.length));
	}

	if (cc.length !== 0) {
		setChunks('cc', cc, (cc.length && !bcc.length));
	}

	if (bcc.length !== 0) {
		setChunks('bcc', bcc, true);
	}

	return await sendAndReturn(messages, transporter);
};

/*
Valida os dados e prepara envio

	-> from: Array simples com unico recipiente, ex.: ['mail@sender', 'name sender'] ou ['mail@sender']

	-> to: Array bidimensional ex.: [['mail@to1', 'name to1']] ou [['mail@to1', 'name to1'], ['mail@to2', 'name to2'], ['mail@to3'], ... ]
		* Usar '' ou [] para nenhum e-mail

	-> cc: Array bidimensional ex.: [['mail@cc1', 'name cc1']] ou [['mail@cc1', 'name cc1'], ['mail@cc2', 'namecc2'], ['mail@cc3'], ... ]
		* Usar '' ou [] para nenhum e-mail

	-> bcc: Array bidimensional ex.: [['mail@bcc1', 'name bcc1']] ou [['mail@bcc1', 'name bcc1'], ['mail@bcc2', 'name bcc2'], ['mail@bcc3'], ... ]
		* Usar '' ou [] para nenhum e-mail

	-> subject: string - pode ser vazio

	-> text: string: texto em html ou simples

	-> Attachments: Array [{ filename: , content: }, { filename: , path: }, { path: }, ... ]

	-> sendChunks: Define se os e-mails serao enviados em grupos, objeto vazio para tudo de uma vez. ex.: { to: 5, cc: 5, bcc: 15 }
		- se "to" definido: Quantidade de e-mails de destino (to) agrupados para cada envio simultaneo separado (apenas to)
		- se "cc" definido: Quantidade de e-mails de destino (cc) agrupados para cada envio simultaneo separado (apenas cc)
		- se "bcc" definido: Quantidade de e-mails de destino (bcc) agrupados para cada envio simultaneo separado (apenas bcc)
		- se "inheritTo" definido: quando true, propriedade "to" de sendChunks deve estar ausente do objeto. Neste caso, a propriedade "to" definida no e-mail será acoplada para cada chunk cc e/ou bcc
			* Apenas "to" sera repetido em cada envio.

	-> strictCheck: se true realiza uma validacao rigorosa dos e-mails de destino, obrigando todos os e-mails informados a serem validos e unicos (padrao true)

	-> sendQueue: se true nao envia os e-mails instantaneamente, mas sim os colocam como arquivos em uma pasta para serem enfileirados e enviados posteriormente na queue (padrao false)
*/
const sendEmail = async (from, to, cc, bcc, subject, text, attachments = [], sendChunks = {}, strictCheck = true, sendQueue = false) => {
	const fillDestinations = (a, b, e) => {
		let i = 0;

		if (!validator.isEmpty(a)) {
			if (Array.isArray(a)) {
				if (Array.isArray(a[0])) {
					const emailListCheckUnique = [];

					a.forEach(
						recip => {
							if (Array.isArray(recip)) {
								const recipLen = recip.length;

								if ((recipLen === 1 || recipLen === 2) && recip[0].constructor === String) {
									const email = recip[0];
									const name = (recipLen === 2 && recip[1].constructor === String ? recip[1] : '');
									const emailCheckUnique = email.toLowerCase();

									if (validator.isEmail(email)) {
										if (!emailListCheckUnique.includes(emailCheckUnique)) {
											emailListCheckUnique.push(emailCheckUnique);

											if (!validator.isEmpty(name)) {
												b.push(`${name} <${email}>`);
											} else {
												b.push(email);
											}

											i++;
										}
									}
								} else {
									e.push(`E-mail de destino ( ${recip} ) precisa ser uma array simples no formato ['destino@email', 'destinonome'] ou ['destino@email']...`);
								}
							} else {
								e.push(`E-mail de destino ( ${recip} ): entrada não está no formato de Array...`);
							}
						}
					);
				} else {
					e.push(`Array de entrada para e-mail(s) de destino ( ${a} ) é inválida. Utilize array bidimensional, com uma array específica para cada e-mail de destino...`);
				}
			} else {
				e.push(`E-mail(s) de destino ( ${a} ): entrada não está no formato de Array...`);
			}
		}

		return i;
	};

	const fromChecked = [];
	const toChecked = [];
	const ccChecked = [];
	const bccChecked = [];
	const attachmentsChecked = [];
	const errorStack = [];

	if (Array.isArray(from)) {
		const fromLen = from.length;

		if ((fromLen === 1 || fromLen === 2) && from[0].constructor === String) {
			const email = from[0];
			const name = (fromLen === 2 && from[1].constructor === String ? from[1] : '');

			if (validator.isEmail(email)) {
				if (!validator.isEmpty(name)) {
					fromChecked.push(`${name} <${email}>`);
				} else {
					fromChecked.push(email);
				}
			}
		} else {
			errorStack.push(`E-mail de origem ( ${from} ) precisa ser uma array simples no formato ['origem@email', 'origemnome'] ou ['origem@email']...`);
		}
	} else {
		errorStack.push(`E-mail de origem ( ${from} ): entrada não está no formato de Array...`);
	}

	const toCount = fillDestinations(to, toChecked, errorStack);
	const ccCount = fillDestinations(cc, ccChecked, errorStack);
	const bccCount = fillDestinations(bcc, bccChecked, errorStack);

	if (fromChecked.length === 0) {
		errorStack.push('Nenhum e-mail de origem válido. Verifique os dados informados...');
	}

	if (toCount === 0 && ccCount === 0 && bccCount === 0) {
		errorStack.push('Nenhum e-mail de destino válido. Verifique os dados informados...');
	} else {
		if (strictCheck) {
			if (to.length !== toCount || cc.length !== ccCount || bcc.length !== bccCount) {
				errorStack.push('strictCheck: Alguns e-mails de destino foram invalidados. Verifique os dados informados...');
			}
		}
	}

	if (typeof subject !== 'string') {
		errorStack.push('Assunto do e-mail deve ser uma string...');
	}

	if (typeof text !== 'string') {
		errorStack.push('Conteúdo do e-mail deve ser uma string...');
	} else {
		if (validator.isEmpty(text)) {
			errorStack.push('Conteúdo do e-mail está vazio...');
		}
	}

	if (Array.isArray(attachments) && attachments.length > 0) {
		for (let i = 0; i < attachments.length; i++) {
			if (typeof attachments[i] === 'object' && attachments[i] !== null) {
				const oLen = Object.entries(attachments[i]);
				const oStringify = JSON.stringify(attachments[i]);

				if ((oLen.length === 3 || oLen.length === 4) && Object.prototype.hasOwnProperty.call(attachments[i], 'filename') && Object.prototype.hasOwnProperty.call(attachments[i], 'content') && Object.prototype.hasOwnProperty.call(attachments[i], 'encoding')) {
					if (oLen.length === 4 && !Object.prototype.hasOwnProperty.call(attachments[i], 'contentType')) {
						errorStack.push(`Anexos: ${oStringify} tem uma quarta propriedade que não é o contentType...`);
					} else {
						attachmentsChecked.push(attachments[i]);
					}
				} else {
					if ((oLen.length === 2 || oLen.length === 3) && Object.prototype.hasOwnProperty.call(attachments[i], 'filename') && Object.prototype.hasOwnProperty.call(attachments[i], 'path')) {
						if (oLen.length === 3 && !Object.prototype.hasOwnProperty.call(attachments[i], 'contentType')) {
							errorStack.push(`Anexos: ${oStringify} tem uma terceira propriedade que não é o contentType...`);
						} else {
							attachmentsChecked.push(attachments[i]);
						}
					} else {
						if ((oLen.length === 1 || oLen.length === 2) && Object.prototype.hasOwnProperty.call(attachments[i], 'path')) {
							if (oLen.length === 2 && !Object.prototype.hasOwnProperty.call(attachments[i], 'contentType')) {
								errorStack.push(`Anexos: ${oStringify} tem uma segunda propriedade que não é o contentType...`);
							} else {
								attachmentsChecked.push(attachments[i]);
							}
						} else {
							errorStack.push(`Anexos: ${oStringify} deve seguir o padrão { filename: , content: , encoding: , contentType: } ou { filename: , path: , contentType: } ou { path: , contentType: }. "contentType" é opcional e "Content" (caso exista) precisa ser um buffer de dados...`);
						}
					}
				}
			} else {
				errorStack.push(`Anexos: ${attachments[i]} deve ser um objeto...`);
			}
		}

		if (attachments.length !== attachmentsChecked.length) {
			errorStack.push('Alguns anexos foram invalidados. Verifique os dados informados...');
		}
	}

	if (typeof sendChunks === 'object' && sendChunks !== null) {
		if (Object.entries(sendChunks).length !== 0) {
			if (!Object.prototype.hasOwnProperty.call(sendChunks, 'to') && !Object.prototype.hasOwnProperty.call(sendChunks, 'cc') && !Object.prototype.hasOwnProperty.call(sendChunks, 'bcc')) {
				errorStack.push('sendChunks deve conter pelo menos uma dessas chaves: to, cc ou bcc...');
			} else {
				if (Object.prototype.hasOwnProperty.call(sendChunks, 'to') && (!Number.isInteger(sendChunks.to) || Number(sendChunks.to) < 1)) {
					errorStack.push('sendChunks: Propriedade to de deve ser um número inteiro e positivo...');
				} else {
					if (Object.prototype.hasOwnProperty.call(sendChunks, 'to') && Object.prototype.hasOwnProperty.call(sendChunks, 'inheritTo')) {
						errorStack.push('sendChunks: Propriedade inheritTo deve existir apenas se não existir a propriedade to...');
					}
				}

				if (Object.prototype.hasOwnProperty.call(sendChunks, 'cc') && (!Number.isInteger(sendChunks.cc) || Number(sendChunks.cc) < 1)) {
					errorStack.push('sendChunks: Propriedade cc deve ser um número inteiro e positivo...');
				}

				if (Object.prototype.hasOwnProperty.call(sendChunks, 'bcc') && (!Number.isInteger(sendChunks.bcc) || Number(sendChunks.bcc) < 1)) {
					errorStack.push('sendChunks: Propriedade bcc deve ser um número inteiro e positivo...');
				}
			}
		}
	} else {
		errorStack.push('sendChunks deve ser um objeto...');
	}

	if (sendQueue && !__serverConfig.email.queue.on) {
		errorStack.push('Fila de e-mails não está habilitada no servidor. Verifique o arquivo de configuração...');
	}

	if (errorStack.length !== 0) {
		errWrapper.throwThis('EMAIL', 400, errorStack);
	}

	return await _executeSend(fromChecked, toChecked, ccChecked, bccChecked, subject, text, attachmentsChecked, sendChunks, sendQueue);
};

// Prepara a array de arquivos a serem anexados
//		attachments => arquivos a serem anexados (base de comparacao do codigo: lib uploader)
const getAttachments = attachments => {
	const attachmentsResult = [];

	if (Array.isArray(attachments)) {
		attachments.forEach(
			file => {
				const objFile = {};

				if (file.originalname) {
					objFile.filename = file.originalname;
				}

				if (file.path) {
					objFile.path = file.path;
				} else {
					if (file.buffer) {
						if (Buffer.isBuffer(file.buffer)) {
							objFile.content = Buffer.from(file.buffer).toString('base64');
							objFile.encoding = 'base64';
						}
					}
				}

				if (file.mimetype) {
					objFile.contentType = file.mimetype;
				}

				attachmentsResult.push(objFile);
			}
		);
	}

	return attachmentsResult;
};
// -------------------------------------------------------------------------

module.exports = {
	sendEmail,
	getAttachments
};
