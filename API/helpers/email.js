'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const nodemailer = require("nodemailer");
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Envia e-mails pelo servidor (metodo privado)
const _executeSend = async (from, to, subject, text, attachments) => {
	try {
		let transporter = nodemailer.createTransport(__serverConfig.email.transporter),
			message = {
				'from': from,
				'to': to,
				envelope: {
					'from': from,
					'to': to
				},
				'subject': subject,
				'text': text,
				'html': text
			};

		if (Array.isArray(attachments) && attachments.length > 0) {
			message.attachments = attachments;
		}

		return await transporter.sendMail(message);
	} catch(err) {
		throw new Error(err);
	}
};

const sendEmail = async (from, to, subject, text, attachments) => {
	try {
		return await _executeSend(from, to, subject, text, attachments);
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

module.exports = {
	sendEmail
};
