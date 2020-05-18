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

	-> extraPath vazio para upload de arquivos direto na pasta default, ou informa pasta(s) extras
		-> default: ''

	-> storageToDisk true para diskStorage | false para memoryStorage (default: true)
		-> se memoryStorage selecionado, utilizar Buffer.from(file.buffer).toString('base64') para converter valor da memoria

	-> extensionsFromConfig define um subconjunto customizado de extensoes do config (fileUpload.allowedFiles) que estao permitidas
		-> default: '' ou todas as extensoes definidas no config estao permitidas
		-> usar apenas extensoes, como no exemplo: ".gif | .png | .pdf"
		-> se a extensao informada no parametro nao existir tambem no config, nao funciona

	-> maxFileSize indica o tamanho maximo para upload
		-> em bytes, default 524288 (500KB)

	-> maxFileUploads indica o numero maximo de arquivo permitidos para upload
		-> default: 0 ou ilimitado
*/
const push = async (req, res, fieldNames, extraPath = '', storageToDisk = true, extensionsFromConfig = '', maxFileSize = 524288, maxFileUploads = 0) => {
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
							const allowedFiles = String(configUpload.allowedFiles || '').split('|').map(
								item => {
									const separator = item.indexOf(':');
									const extension = item.substr(0, (separator !== -1 ? separator : item.length)).trim().toLowerCase();
									const mimeType = item.substr((separator !== -1 ? separator + 1 : '')).trim().toLowerCase();

									const acceptItem = (
										extensionsFromConfig ? (
											extensionsFromConfig.split('|').some(
												extensionFromConfig => {
													return (extensionFromConfig.trim().toLowerCase() === extension);
												}
											)
										) : (
											true
										)
									);

									return (acceptItem ? { extension, mimeType } : { extension: '', mimeType: '' });
								}
							);

							// O new Set remove duplicados, assim podemos repetir extensoes para eventuais novos MIME Types
							const allowedExtensions = [...new Set(allowedFiles.map(
								obj => {
									return obj.extension;
								}
							))]
							.filter(
								item => {
									return (
										item !== ''
									);
								}
							);

							// O new Set remove duplicados, assim podemos repetir extensoes para eventuais novos MIME Types
							const allowedMimeTypes = [...new Set(allowedFiles.map(
								obj => {
									return obj.mimeType;
								}
							))]
							.filter(
								item => {
									return (
										item !== ''
									);
								}
							);

							const fileExtension = path.extname(file.originalname).toLowerCase();
							const fileMimetype = file.mimetype.toLowerCase();
							const checkedExtension = new RegExp(`^(${allowedExtensions.join('|')}){1}$`, 'i').test(fileExtension);
							const checkedMimeType = new RegExp(`^(${allowedMimeTypes.join('|')}){1}$`, 'i').test(fileMimetype);

							if (checkedExtension && checkedMimeType) {
								callback(null, true);
							} else {
								callback(
									errWrapper.throwThis('UPLOADER', 400, `Upload de arquivos suporta apenas as seguintes extensões - ${allowedExtensions.join(', ')} com seus respectivos MIME Types - ${allowedMimeTypes.join(', ')}...`)
								);
							}
						} catch (err) {
							callback(err);
						}
					},
					limits: {
						fileSize: (maxFileSize || Infinity),
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
					if (err instanceof multer.MulterError) {
						if (err.name) {
							err.name = 'UPLOADER';
						}

						// Erros do multer personalizados
						switch (err.code) {
							case 'LIMIT_FILE_COUNT': {
								err.code = 400;

								if (err.message) {
									err.message = `Muitos arquivos para upload - a quantidade máxima permitida para upload é de ${maxFileUploads + (maxFileUploads === 1 ? ' arquivo' : ' arquivos')}...`;
								}

								break;
							}
							case 'LIMIT_FILE_SIZE' : {
								err.code = 400;

								if (err.message) {
									err.message = `Um ou mais arquivos estão muito estão grandes - o tamanho máximo de um arquivo para upload é de ${parseInt(maxFileSize / 1024, 10)} KB...`;
								}

								break;
							}
						}
					}

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

	if (req.method.toUpperCase() !== 'POST') {
		errWrapper.throwThis('UPLOADER', 400, 'Favor utilizar verbo POST para realizar o upload dos arquivos...');
	}

	return await uploadFiles(formatFieldNames(fieldNames));
};
// -------------------------------------------------------------------------

module.exports = {
	push
};
