'use strict';

// -------------------------------------------------------------------------
// Modulos de inicializacao
const io = require('socket.io');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Modulos de apoio
const home = require('@serverRoot/helpers/home');
// -------------------------------------------------------------------------

// -------------------------------------------------------------------------
// Inicia um novo servidor io
const startIo = server => {
	return io.listen(server);
};

// listeners para socket.io separados por rota ou funcao
const listeners = {
	root(io) { // Listeners para Home do servidor
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
	}
};
// -------------------------------------------------------------------------

module.exports = {
	startIo,
	listeners
};
