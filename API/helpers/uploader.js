'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const multer = require('multer');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Realiza o upload de um ou mais arquivos
// formato para fileNames: [{ name: 'inputFileName1' }, { name: 'inputFileName2' }, { name: 'inputFileName3' },...]
const execute = async (req, res, fileNames, storageToDisk = true) => {
	try {
		const diskStorage = multer.diskStorage({
			destination: function (req, file, callback) {
				let filePath = __serverRoot + __serverConfig.server.fileUpload.path;

				callback(null, filePath);
			},
			filename: function (req, file, callback) {
				let fileOriginalName = file.originalname,
					findLastDot = fileOriginalName.lastIndexOf('.'),
					dateNow = (new Date()).toISOString().split('T'),
					dateLeft = (dateNow[0] || '').replace(/-/g, ''),
					dateRight = (dateNow[1] || '').replace(/[:]/g, '').substr(0, 6),
					fileName = fileOriginalName.substring(0, (findLastDot !== -1 ? findLastDot : fileOriginalName.length)) + '-' + dateLeft + dateRight + (findLastDot !== -1 ? fileOriginalName.substr(findLastDot) : '');

				callback(null, fileName);
			}
		});

		const uploadFiles = fileNames => {
			return new Promise((resolve, reject) => {
				try {
					const upload = multer({ storage : (storageToDisk ? diskStorage : multer.memoryStorage()) }).fields(fileNames); // .any() para qualquer coisa

					upload(req, res,
						err => {
							if (err) {
								reject(err);
							} else {
								resolve(req.files);
							}
						}
					);
				} catch(err) {
					reject(err);
				}
			});
		};

		return await uploadFiles(fileNames);
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

module.exports = {
	execute
};
