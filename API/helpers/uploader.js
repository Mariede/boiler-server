'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const multer = require('multer');
const fs = require('fs');
const path = require('path');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Realiza o upload de um ou mais arquivos (POST / enctype: "multipart/form-data")

/*
-> Sempre array de objects para fileNames ou vazio para todos (sem checagem de nomes)
	-> formato para fileNames: [{ name: 'inputFileName1' }, { name: 'inputFileName2' }, { name: 'inputFileName3' }, ...]

-> extraPath vazio para upload de arquivos direto na pasta default, ou informa pasta(s) extras (abaixo)

-> maxFileUploads indica o numero maximo de arquivo permitidos para upload (default: ilimitado)

-> storageToDisk true para diskStorage | false para memoryStorage (default: true)
	-> se memoryStorage selecionado, utilizar req.buffer.toString('utf8') para converter valor da memoria
*/
const push = async (req, res, fileNames, extraPath, maxFileUploads = Infinity, storageToDisk = true) => {
	try {
		const diskStorage = multer.diskStorage({
			destination: (req, file, callback) => {
				let filePath = __serverRoot + __serverConfig.server.fileUpload.path;

				if (storageToDisk) {
					if (!fs.existsSync(filePath)) {
						fs.mkdirSync(filePath);
					}

					if (extraPath) {
						extraPath.replace(/[|&;$%@"<>()+,]/g, '').split(/[\\/]/).forEach(
							e => {
								filePath = path.join(filePath, e);

								if (!fs.existsSync(filePath)) {
									fs.mkdirSync(filePath);
								}
							}
						);
					}
				}

				callback(null, filePath);
			},
			filename: (req, file, callback) => {
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
					const upload = multer(
						{
							fileFilter: (req, file, callback) => {
								let fileTypes = new RegExp(__serverConfig.server.fileUpload.allowedExtensions, 'i'),
									mimeType = fileTypes.test(file.mimetype),
									extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

								if (mimeType && extName) {
									return callback(null, true);
								} else {
									callback('Uploader: Upload de arquivos apenas suporta as seguintes extensões - ' + __serverConfig.server.fileUpload.allowedExtensions);
								}
							},
							storage: (storageToDisk ? diskStorage : multer.memoryStorage()),
							limits: {
								fileSize: (__serverConfig.server.fileUpload.maxFileSize || Infinity),
								files: (maxFileUploads || Infinity)
							}
						}
					);

					const result = err => {
						if (err) {
							reject(err);
						} else {
							resolve({ body: { ...req.body }, files: { ...req.files } });
						}
					};

					if (fileNames) {
						upload.fields(fileNames)(req, res,
							err => {
								result(err);
							}
						);
					} else {
						upload.any()(req, res,
							err => {
								result(err);
							}
						);
					}
				} catch(err) {
					reject(err);
				}
			});
		};

		let method = req.method;

		if (method.toUpperCase() === 'POST') {
			return await uploadFiles(fileNames);
		} else {
			throw new Error('Uploader: Favor utilizar verbo POST para realizar o upload dos arquivos...');
		}
	} catch(err) {
		throw new Error(err);
	}
};
// -------------------------------------------------------------------------

module.exports = {
	push
};
