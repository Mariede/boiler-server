'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const fs = require('fs');
const multer = require('multer');
const path = require('path');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const errWrapper = require('@serverRoot/helpers/err-wrapper');
const functions = require('@serverRoot/helpers/functions');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
/*
Realiza o upload de um ou mais arquivos (POST / enctype: "multipart/form-data")

	-> fieldNames: campo html que informa a localizacao dos arquivos de upload no form (se mais de um campo, separar por virgula)
		-> "inputFieldName1, inputFieldName2, inputFieldName3, ..."

	-> extraPath vazio para upload de arquivos direto na pasta default, ou informa pasta(s) extras (default: vazio)

	-> maxFileUploads indica o numero maximo de arquivo permitidos para upload (default: 0 ou ilimitado)

	-> storageToDisk true para diskStorage | false para memoryStorage (default: true)
		-> se memoryStorage selecionado, utilizar Buffer.from(req.files[].buffer, 'utf8') para converter valor da memoria
*/
const push = async (req, res, fieldNames, extraPath = '', maxFileUploads = 0, storageToDisk = true) => {
	const uploadFiles = formattedFieldNames => {
		return new Promise((resolve, reject) => {
			const diskStorage = multer.diskStorage(
				{
					destination: (req, file, callback) => {
						try {
							const configKey = configUpload.path + (extraPath ? `/${extraPath}` : '');

							let initPath = __serverRoot;

							const filePath = initPath + configKey;

							fs.access(
								filePath,
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
														callback(err);
													}
												}
											);
										}

										callback(null, filePath);
									} catch (err) {
										callback(err);
									}
								}
							);
						} catch (err) {
							callback(err);
						}
					},
					filename: (req, file, callback) => {
						try {
							const fileOriginalName = file.originalname;
							const findLastDot = fileOriginalName.lastIndexOf('.');
							const uniqueId = functions.generateUniqueId(3);
							const fileName = `${fileOriginalName.substring(0, (findLastDot !== -1 ? findLastDot : fileOriginalName.length))}-${uniqueId + (findLastDot !== -1 ? fileOriginalName.substr(findLastDot) : '')}`;

							callback(null, fileName);
						} catch (err) {
							callback(err);
						}
					}
				}
			);

			const upload = multer(
				{
					fileFilter: (req, file, callback) => {
						try {
							const allowedExtensions = String(configUpload.allowedExtensions || '');

							const checkExtensions = [...new Set(allowedExtensions.split('|').map(
								item => {
									return item.substr(0, (item.indexOf(':') !== -1 ? item.indexOf(':') : item.length)).trim();
								}
							))].filter(
								item => {
									return item !== '';
								}
							); // O new Set para valores unicos e nao vazios (remove duplicados), assim podemos repetir extensoes para eventuais novos MIME Types

							const checkMimeTypes = [...new Set(allowedExtensions.split('|').map(
								item => {
									return item.substr((item.indexOf(':') !== -1 ? item.indexOf(':') + 1 : '')).trim();
								}
							))].filter(
								item => {
									return item !== '';
								}
							); // O new Set para valores unicos e nao vazios (remove duplicados), assim podemos repetir extensoes para eventuais novos MIME Types

							const extName = new RegExp(`^(${checkExtensions.join('|')}){1}$`, 'i').test(path.extname(file.originalname).toLowerCase());
							const mimeType = new RegExp(`^(${checkMimeTypes.join('|')}){1}$`, 'i').test(file.mimetype);

							if (extName && mimeType) {
								callback(null, true);
							} else {
								callback(
									errWrapper.throwThis('UPLOADER', 400, `Upload de arquivos apenas suporta as seguintes extensões - ${checkExtensions.join(', ')} com seus respectivos MIME Types - ${checkMimeTypes.join(', ')}...`)
								);
							}
						} catch (err) {
							callback(err);
						}
					},
					limits: {
						fileSize: (configUpload.maxFileSize || Infinity),
						files: (maxFileUploads || Infinity)
					},
					storage: (storageToDisk ? diskStorage : multer.memoryStorage())
				}
			);

			const showResults = err => {
				const filesToArray = uploadedResults => {
					const files = [];

					Object.keys(uploadedResults.originalFiles).forEach(
						fieldName => {
							const uploadedFiles = uploadedResults.originalFiles[fieldName];

							if (uploadedFiles) {
								uploadedFiles.forEach(
									file => {
										files.push(file);
									}
								);
							}
						}
					);

					return files;
				};

				if (err) {
					reject(err);
				} else {
					resolve({ body: { ...req.body }, files: filesToArray({ originalFiles: { ...req.files } }) });
				}
			};

			upload.fields(formattedFieldNames)(
				req,
				res,
				err => {
					showResults(err);
				}
			);
		});
	};

	// Saida formatada (array de objetos) => [{ name: 'inputFieldName1' }, { name: 'inputFieldName2' }, { name: 'inputFieldName3' }, ...]
	const formatFieldNames = _fieldNames => {
		return (
			String(_fieldNames || '').split(',')
			.map(
				fieldName => {
					const trimmed = fieldName.trim();
					return (trimmed ? { name: trimmed } : {});
				}
			)
			.filter(
				fieldName => {
					return (Object.keys(fieldName).length === 1 && Object.prototype.hasOwnProperty.call(fieldName, 'name'));
				}
			)
		);
	};

	const configUpload = __serverConfig.server.fileUpload;
	const method = req.method;

	if (method.toUpperCase() !== 'POST') {
		errWrapper.throwThis('UPLOADER', 400, 'Favor utilizar verbo POST para realizar o upload dos arquivos...');
	}

	return await uploadFiles(formatFieldNames(fieldNames));
};
// -------------------------------------------------------------------------

module.exports = {
	push
};
