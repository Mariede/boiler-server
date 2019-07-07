'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const home = require('@serverRoot/helpers/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// listeners para socket.io separados por rota ou funcao

// Home do servidor
const listenersRoot = io => {
	const ioNameSpace = home.rootIoNameSpace;

	let rootServerTime = null;

	io.of(ioNameSpace).on('connection', data => {
		data.once('serverTimeStart', () => {
			rootServerTime = setInterval(() => {
				io.of(ioNameSpace).emit('serverTimeTick', home.rootFormatDateNow());
			}, 1000);
		});

		data.once('disconnect', () => {
			clearInterval(rootServerTime);
		});
	});
};
// -------------------------------------------------------------------------

module.exports = {
	listenersRoot
};
