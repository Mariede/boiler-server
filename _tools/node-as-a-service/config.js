'use strict';

/*
Para modo silencioso (eliminar stderr e stdout) atualizar chave logmode para none no arquivo xml pasta daemon
*/

const project = 'BOILER-SERVER';

const config = {
	name: `NODE - ${project}`, // Nome do servico
	description: `Serviço associado a aplicação NODE - ${project}`, // Descricao que vai aparecer no Gerenciamento de serviço do Windows
	script: 'C:\\project-path\\API\\main.js', // Caminho absoluto do script ou aplicacao no servidor
	env: [
		{
			name: 'NODE_ENV',
			value: 'production'
		}
	]
};

module.exports = config;
