'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const home = require('@serverRoot/helpers/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// listeners para socket.io separados por rota ou funcao

// Home do servidor
const listenersRoot = io => {
	const ioChannel = io.of(home.rootIoNameSpace);

	ioChannel.on('connection', socket => {
		let rootServerTime = null;

		socket.once('serverTimeStart', () => {
			rootServerTime = setInterval(() => {
				ioChannel.to(socket.id).emit('serverTimeTick', home.rootFormatDateNow());
			}, 1000);
		});

		socket.once('disconnect', () => {
			clearInterval(rootServerTime);
		});
	});
};
// -------------------------------------------------------------------------

module.exports = {
	listenersRoot
};
