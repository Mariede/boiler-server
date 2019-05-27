'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const validator = require('@serverRoot/helpers/validator');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Dados validados, envia e-mails pelo servidor (metodo privado)
const _executeSend = async (from, to, cc, bcc, subject, text, attachments, sendChuncks) => {
	try {
		const asyncForEach = async (a, callback) => {
			for (let i = 0; i < a.length; i++) {
				await callback(a[i], i, a);
			}
		};

		const sendAndReturn = async (m, t) => {
			let infos = [];

			await asyncForEach(
				m,
				async e => {
					infos.push(await t.sendMail(e));
				}
			);

			return infos;
		};

		let transporter = nodemailer.createTransport(__serverConfig.email.transporter),
			message = {
				'from': from,
				'subject': subject,
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

		// codigo para envio por chunks aqui (preenche messages por chunks de destinatarios)
		if (to.length !== 0) {
			message.to = to;
		}

		if (cc.length !== 0) {
			message.cc = cc;
		}

		if (bcc.length !== 0) {
			message.bcc = bcc;
		}

		messages.push(message);
		// codigo para envio por chunks aqui (preenche messages por chunks de destinatarios)

		return await sendAndReturn(messages, transporter);
	} catch(err) {
		throw new Error(err);
	}
};

// Valida os dados e prepara envio
/*
from: Array com unico recipiente, ex.: ['mail@sender', 'name sender'] ou ['mail@sender'] ou [['mail@sender', 'name sender']] ou [['mail@sender']]
to: Array com unico recipiente ou Multi-Array (mais de um recipiente) ex.: [['mail@to1', 'name to1'], ['mail@to2', 'name to2'], ['mail@to3'], ... ]
cc: Array com unico recipiente ou Multi-Array (mais de um recipiente) ex.: [['mail@cc1', 'name cc1'], ['mail@cc2', 'namecc2'], ['mail@cc3'], ... ]
bcc: Array com unico recipiente ou Multi-Array (mais de um recipiente) ex.: [['mail@bcc1', 'name bcc1'], ['mail@bcc2', 'name bcc2'], ['mail@bcc3'], ... ]
subject: string: opcional
text: string: texto em html ou simples
Attachments: Array [[arttach1], [attach2], [attach3], ... ] - opcional
sendChuncks: Define se os e-mails serao enviados em chuncks, vazio para tudo de uma vez. ex.: sendChuncks => { to: 5, cc: 10 } ou { bcc: 15 }
strictCheck: se true realiza uma validacao rigorosa dos e-mails de destino, obrigando todos os e-mails informados a serem validos e unicos
*/
const sendEmail = async (from, to, cc, bcc, subject, text, attachments, sendChuncks = {}, strictCheck = true) => {
	try {
		const preencheDestinos = (a, b, i, e) => {
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
										i++;

										if (!validator.isEmpty(name)) {
											b.push(`${name} <${email}>`);
										} else {
											b.push(email);
										}
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
			if (from[0].constructor !== Array) {
				from = [from];
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
				errorStack.push(`Array de entrada para e-mail de origem ( ${from} ) não possui conteúdo ou possui mais de um recipiente informado...`);
			}
		} else {
			errorStack.push(`E-mail de origem ( ${from} ): entrada não está no formato de Array...`);
		}

		toCount = preencheDestinos(to, toChecked, toCount, errorStack);
		ccCount = preencheDestinos(cc, ccChecked, ccCount, errorStack);
		bccCount = preencheDestinos(bcc, bccChecked, bccCount, errorStack);

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


/*
pendente attachments / exibir nomes ao inves do e-mail / chunks de e-mails
*/
		// if (Array.isArray(attachments) && attachments.length > 0) {
		// 	attachmentsChecked.push = attachments[i];
		// }


		if (errorStack.length === 0) {
			return await _executeSend(fromChecked, toChecked, ccChecked, bccChecked, subject, text, attachmentsChecked, sendChuncks);
		} else {
			return errorStack;
		}
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

module.exports = {
	sendEmail
};
