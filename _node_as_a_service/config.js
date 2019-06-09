const config = {
	name: 'NODE as a Service', // Nome do servico
	description: 'Serviço associado a uma aplicação NODE', // Descricao que vai aparecer no Gerenciamento de serviço do Windows
	script: 'C:\\project-path\\API\\app.js', //caminho absoluto do script ou aplicacao
	env: [
		{
			name: 'NODE_ENV',
			value: 'production'
		}
	]
}

module.exports = config;
