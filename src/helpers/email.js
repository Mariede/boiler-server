'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const validator = require('@serverRoot/helpers/validator');
const fs = require('fs');
const path = require('path');
const errWrapper = require('@serverRoot/helpers/errWrapper');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------

// Queue: E-mails como arquivos em uma fila para serem enviados posteriormente (metodo privado)
const _executeQueue = (e, counter) => {
	return new Promise((resolve, reject) => {
		try {
			const configQueue = __serverConfig.email.queue;
			const configKey = configQueue.path;
			const queueFile = JSON.stringify(e);
			const dateNow = (new Date()).toISOString().split('T');
			const dateLeft = (dateNow[0] || '').replace(/-/g, '');
			const dateRight = (dateNow[1] || '').replace(/[:.]/g, '').substr(0, 9);
			const uniqueId = parseInt(((Math.random() * 9) + 1) * Math.pow(10, 5), 10);

			let initPath = __serverRoot,
				queuePathSend = initPath + configKey;

			const fileName = queuePathSend + '\\mail-queue-' + dateLeft + dateRight + counter + '.' + uniqueId + configQueue.fileExtension;

			fs.access(
				queuePathSend,
				fs.constants.F_OK, // check if exists
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

						fs.writeFile(fileName, queueFile, 'utf8',
							err => {
								if (err) {
									reject(err);
								} else {
									resolve(queueFile);
								}
							}
						);
					} catch(err) {
						reject(err);
					}
				}
			);
		} catch(err) {
			reject(err);
		}
	});
};

// Dados validados, e-mails serao enviados ou colocados na fila (metodo privado)
const _executeSend = async (from, to, cc, bcc, subject, text, attachments, sendChunks, sendQueue) => {
	try {
		const setChunks = (key, d, lastCall) => {
			const setMessages = value => {
				let msg = JSON.parse(JSON.stringify(message));
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

		const asyncForEach = async (a, callback) => {
			for (let i = 0; i < a.length; i++) {
				await callback(a[i], i, a);
			}
		};

		const sendAndReturn = async (m, t) => {
			let sentInfos = [],
				i = 0;

			await asyncForEach(
				m,
				async e => {
					i++;

					if (!sendQueue) {
						sentInfos.push(await t.sendMail(e)); // envia chunk de e-mails
					} else {
						sentInfos.push(await _executeQueue(e, i)); // queue chunk de e-mails
					}
				}
			);

			return sentInfos;
		};

		const transporter = nodemailer.createTransport(__serverConfig.email.transporter);

		let message = {
				'from': from,
				'subject': subject
			},
			messages = [];

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
	} catch(err) {
		throw err;
	}
};

// Valida os dados e prepara envio
/*
from: Array com unico recipiente, ex.: ['mail@sender', 'name sender'] ou ['mail@sender'] ou [['mail@sender', 'name sender']] ou [['mail@sender']]

to: Array com unico recipiente ou Multi-Array (mais de um recipiente) ex.: [['mail@to1', 'name to1'], ['mail@to2', 'name to2'], ['mail@to3'], ... ]
	* Usar '' (vazio) para nenhum e-mail

cc: Array com unico recipiente ou Multi-Array (mais de um recipiente) ex.: [['mail@cc1', 'name cc1'], ['mail@cc2', 'namecc2'], ['mail@cc3'], ... ]
	* Usar '' (vazio) para nenhum e-mail

bcc: Array com unico recipiente ou Multi-Array (mais de um recipiente) ex.: [['mail@bcc1', 'name bcc1'], ['mail@bcc2', 'name bcc2'], ['mail@bcc3'], ... ]
	* Usar '' (vazio) para nenhum e-mail

subject: string - opcional

text: string: texto em html ou simples

Attachments: Array [{ filename: , content: }, { filename: , path: }, { path: }, ... ] - opcional

sendChunks: Define se os e-mails serao enviados em grupos, objeto vazio para tudo de uma vez. ex.: { to: 5, cc: 5, bcc: 15 }
	- se "to" definido: Quantidade de e-mails de destino (to) agrupados para cada envio simultaneo separado (apenas to)
	- se "cc" definido: Quantidade de e-mails de destino (cc) agrupados para cada envio simultaneo separado (apenas cc)
	- se "bcc" definido: Quantidade de e-mails de destino (bcc) agrupados para cada envio simultaneo separado (apenas bcc)
	- se "inheritTo" definido: quando true, propriedade "to" de sendChunks deve estar ausente do objeto. Neste caso, a propriedade "to" definida no e-mail será acoplada para cada chunk cc e/ou bcc
		* Apenas "to" sera repetido em cada envio.

strictCheck: se true realiza uma validacao rigorosa dos e-mails de destino, obrigando todos os e-mails informados a serem validos e unicos => padrao true

sendQueue: se true nao envia os e-mails instantaneamente, mas sim os colocam como arquivos em uma pasta para serem enviados posteriormente (queue) => padrao false
*/
const sendEmail = async (from, to, cc, bcc, subject, text, attachments, sendChunks = {}, strictCheck = true, sendQueue = false) => {
	try {
		const fillDestinations = (a, b, i, e) => {
			if (!validator.isEmpty(a)) {
				if (Array.isArray(a)) {
					if (a[0].constructor !== Array) {
						a = [a];
					}

					if (a.length !== 0) {
						let emailListCheckUnique = [];

						a.forEach(
							e => {
								let email = (e[0] || ''),
									emailCheckUnique = email.toLowerCase(),
									name =  (e[1] || '');

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
							}
						);
					} else {
						e.push(`Array de entrada para e-mail(s) de destino ( ${a} ) não possui conteúdo...`);
					}
				} else {
					e.push(`E-mail(s) de destino ( ${a} ): entrada não está no formato de Array...`);
				}
			}

			return i;
		};

		let fromChecked = [],
			toChecked = [],
			ccChecked = [],
			bccChecked = [],
			toCount = 0,
			ccCount = 0,
			bccCount = 0,
			attachmentsChecked = [],
			errorStack = [];

		if (Array.isArray(from)) {
			if (from.length !== 0) {
				if (from[0].constructor !== Array) {
					from = [from];
				}
			} else {
				from = [''];
			}

			if (from.length === 1) {
				from.forEach(
					e => {
						let email = (e[0] || ''),
							name =  (e[1] || '');

						if (validator.isEmail(email)) {
							if (!validator.isEmpty(name)) {
								fromChecked.push(`${name} <${email}>`);
							} else {
								fromChecked.push(email);
							}
						}
					}
				);
			} else {
				errorStack.push(`Array de entrada para e-mail de origem ( ${from} ) contém estrutura inválida ou possui mais de um recipiente informado...`);
			}
		} else {
			errorStack.push(`E-mail de origem ( ${from} ): entrada não está no formato de Array...`);
		}

		toCount = fillDestinations(to, toChecked, toCount, errorStack);
		ccCount = fillDestinations(cc, ccChecked, ccCount, errorStack);
		bccCount = fillDestinations(bcc, bccChecked, bccCount, errorStack);

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
					let oLen = Object.entries(attachments[i]),
						oStringify = JSON.stringify(attachments[i]);

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

		if (errorStack.length === 0) {
			return await _executeSend(fromChecked, toChecked, ccChecked, bccChecked, subject, text, attachmentsChecked, sendChunks, sendQueue);
		} else {
			errWrapper.throwThis('EMAIL', 400, errorStack);
		}
	} catch(err) {
		throw err;
	}
};

// Com base no componente de upload (uploader): retorna uma array com os arquivos anexados
const getAttachments = (uploaderResults, fileNames) => {
	return new Promise((resolve, reject) => {
		try {
			let attachmentsResult = [];

			if (uploaderResults && uploaderResults.files && uploaderResults.files[fileNames]) {
				uploaderResults.files[fileNames].forEach(
					file => {
						let objFile = {};

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

			resolve(attachmentsResult);
		} catch(err) {
			reject(err);
		}
	});
};
// -------------------------------------------------------------------------

module.exports = {
	sendEmail,
	getAttachments
};
