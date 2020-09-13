'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio

// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
/*
Verifica se usuario ja possui uma sessao ativa e limpa com base em checkId

	** apenas uma sessao ativa por usuario **
*/
const checkForLoggedSessions = (req, checkId) => {
	return new Promise((resolve, reject) => {
		const sessStore = req.sessionStore;
		const sessWraper = __serverConfig.auth.sessWrapper;

		sessStore.list(
			(err, filesStored) => {
				try {
					if (err) {
						reject(err);
					} else {
						const checkSessionsRead = async _filesStored => {
							const foundIds = await Promise.all(
								_filesStored.map(
									fileStored => {
										return new Promise((resolve, reject) => {
											const fileStoredId = fileStored.split('.')[0];

											sessStore.get(
												fileStoredId,
												(err, fileContent) => {
													try {
														if (err) {
															if (err.code !== 'ENOENT') {
																reject(err);
															} else {
																resolve(); // Arquivo removido durante o processo
															}
														} else {
															if (fileContent && fileContent[sessWraper].id === checkId) {
																sessStore.destroy(
																	fileStoredId,
																	err => {
																		try {
																			if (err) {
																				reject(err);
																			} else {
																				resolve(checkId);
																			}
																		} catch (err) {
																			reject(err);
																		}
																	}
																);
															} else {
																resolve();
															}
														}
													} catch (err) {
														reject(err);
													}
												}
											);
										});
									}
								)
							);

							return foundIds;
						};

						checkSessionsRead(filesStored)
						.then(
							_foundIds => {
								resolve(_foundIds);
							}
						)
						.catch(
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
	});
};

// Verifica se a sessao esta ativa
const isLogged = (req, resType) => { // Se resType === 1 => retorna object. Default: retorna boolean.
	const sess = req.session;
	const sessWraper = __serverConfig.auth.sessWrapper;

	let fRet = (resType === 1 ? {} : false);

	if (Object.prototype.hasOwnProperty.call(sess, sessWraper)) {
		if (resType === 1) {
			fRet = sess[sessWraper];
		} else {
			fRet = true;
		}
	}

	return fRet;
};
// -------------------------------------------------------------------------

module.exports = {
	checkForLoggedSessions,
	isLogged
};
