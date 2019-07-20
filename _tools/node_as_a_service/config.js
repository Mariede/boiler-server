const config = {
	name: 'NODE - {{projeto}}', // Nome do servico
	description: 'Serviço associado a aplicação NODE - {{projeto}}', // Descricao que vai aparecer no Gerenciamento de serviço do Windows
	script: 'C:\\project-path\\API\\app.js', //caminho absoluto do script ou aplicacao no servidor
	env: [
		{
			name: 'NODE_ENV',
			value: 'production'
		}
	]
}

module.exports = config;
