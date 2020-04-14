# boiler-server (boilerplate)

Servidor boilerplate para aplicações Web em Express Node.js - back-end

* Rodar local:
```
npm install
npm start
```

* Build (Webpack):
```
npm run build
```

## Servidor http ou https
  * Clusterização opcional
  * CORS
  * favicon
  * body parser
  * cookie parser
  * compression
  * Pastas de arquivo estáticos (imagens, css ...)
  * Permite aplicações RESTFUL
  * Permite APIs de terceiros
  * Monitoramento do loop de eventos para análises de performance e testes
    - Opcional

## Arquivo de configuração unificado
  * config.json
  * Gerenciamento em tempo real do arquivo de configuração
  * Diversos parâmetros reunidos para configuração do servidor
    - server: configurações gerais do servidor web
    - auth: configurações gerais das permissões de acesso ao servidor web
    - socketIo: configurações gerais do servidor de socketIo (websockets)
    - crypto: configurações gerais de criptografia
    - db: configurações gerais de acesso ao banco de dados (MSSQL ou MongoDB)
    - email: configurações gerais de disparo de e-mail, incluindo queue

## Estrutura de código com pontos definidos de entrada / saída
  * Roteamento em camadas
  * Tratamento conjunto da pilha de Erros (sync e async)
  * Erros personalizados
  * Opção de enviar o stackTrace de erros para o cliente (default falso)

## Prefixamento de rotas e Proxy geral de acesso
  * Via porta 80 (default), configurável
  * Prefixo configurável, atua em todas as rotas da aplicação
  * _tools/proxy/_proxyStart.js

## Websockets configurado junto ao servidor http
  * Conversação bidirecional cliente <-> servidor
  * Biblioteca Socket.io (websockets / pooling)
  * Integrado com a aplicação, mas com servidor próprio em porta separada
  * Proxy automático, direto pelo servidor web
  * Funciona normalmente single-thread e multi-thread (cluster)
  * Trabalha http ou https (ws ou wss), baseado na requisição web

## Possibilidade de utilizar a aplicação como serviço do Windows ou via "Forever"
  * Pacote node-windows
    - Inicia junto com a máquina
    - Serviço reinicia automaticamente, se houver problemas
    - _tools/node_as_a_service/_nodeAsAService.js
  * Pacote Forever (instalar global)
    - Funciona em Windows ou Linux

## Sessions com armazenamento via arquivos criptografados
  * sessionFileStore
  * Utiliza o sistema de arquivos

## Logs com informações na tela e/ou arquivos diários
  * Arquivos de logs separados por grupos
    - Inicialização e acessos ao servidor
    - Erros originários dos controllers
    - Fila de e-mails
    - Acessos e modificações no arquivo de configuração (config.json)

## Autenticação das rotas personalizável
  * Lib de autenticação
    - Rotas protegidas (configurável)
    - isLogged
    - Login / Logout

## Lib de acesso a bancos de dados
  * Parametrizável para MS SQL Server
    - Transacional, acesso a múltiplas queries e stored procedures, agrupadas ou desmembradas, variáveis de output, etc
  * Parametrizável para MongoDB
    - Transacional, via esquemas Mongoose, índices compostos por esquemas, opções extras por esquemas, noSql, etc

## Lib Paginator com paginador e ordenador
  * Configuráveis, items_per_page, current_page, total_pages, ASC/DESC, ordenação por mais de uma coluna, etc
  * Conversão configurável para "lowerCamelCase" do json (recordset de retorno)

## Lib Searcher
  * Facilita as consultas em geral com algorítmo unificado de pesquisa em múltiplas colunas
  * Apenas para MS SQL Server

## Lib Validator
  * Com os métodos de validação de entradas mais comuns (cpf, alfanumérico, e-mail), personalizável via regex

## Lib de Criptografia
  * Hash e Cipher

## Lib Uploader
  * Upload de grupos de arquivos com filtros por tamanho, quantidade de arquivos, extensão, MIME types, ...
  * MULTER: Upload direto para memória ou pastas específicas no servidor

## Lib Email + Queue
  * Envio de e-mails, com anexos, direto e/ou por chunks asyncs e/ou enfileirados em pasta no servidor
  * NODEMAILER: Configuração abrangente
  * Templates de e-mail dinâmicos
  * Filas de e-mails agendados
    - Serviço cíclico e assíncrono
    - Permite cluster ou thread única
    - Gerencia o envio dos e-mails enfileirados

## Lib Functions
  * Com métodos genéricos para acesso global (forEach async, regex de alteração, etc)

## Engine de templates para expor arquivos html dinâmicos
  * EJS - Embedded Javascript Templates (semelhante ao asp)
  * Acoplado ao sistema de views do Express

## Build gerável
  * Através do Webpack
  * Validação de código ESLINT

## Estrutura das pastas do servidor
  * actions
    - métodos com as regras de negócio e codificação dos processos
      + é local, relacionado a rota em execução
      + uma action pode chamar uma ou mais actions e/ou um ou mais helpers
    - as actions podem ser quebradas em subpastas, componentizadas após os controllers
  * cert (* opcional, configurável)
    - contém os arquivos do certificado digital para chamadas https
    - se o modo https estiver desligado, a aplicação desconsidera esta pasta
  * custom
    - pasta com APIs de interfaceamento para outros serviços externos
      + tem a função de um helper, exclusivamente para interfacear serviços externos
  * helpers
    - métodos com as regras de negócio e codificação dos processos
      + é global, relacionado ao projeto e pode ser utilizado por qualquer action ou middleware (núcleo do servidor)
      + um helper pode chamar um ou mais helpers
  * libCom
    - pasta com conteúdo complementar programável das libs, desacoplado do núcleo das mesmas
      + mongooseSchemas.js
        * arquivo contendo os esquemas de acesso ao mongoDB e detalhes relacionados, via mongoose
      + socketIoListeners.js
        * agrupa os listeners e namespaces (caminhos) do servidor para comunicação via Socket.io
        * websockets ou pooling
  * logs (* cria automático, se não existir)
    - arquivos de logs do servidor
  * queue (* opcional, configurável, cria automático - se não existir)
    - arquivos da fila de e-mails
    - e-mails agendados a serem enviados
  * routes
    - define um ou mais controllers para o projeto
    - define as rotas do servidor
    - interface com uma estrutura padrão para as regras de negócio do projeto (actions)
    - ponto centralizador do contato client/server
      + todas as requisições/retornos do cliente são projetadas e passam por aqui
    - os controllers podem ser quebrados em subpastas, componentizados após routes
  * server
    - arquivos de inicialização do servidor e assistência ao seu funcionamento
    - núcleo do servidor, transparente para os projetos
  * sessions (* cria automático, se não existir)
    - arquivos contendo as sessões ativas
  * uploads (* opcional, configurável, cria automático - se não existir)
    - contém pastas e arquivos de upload dos clientes
  * views
    - arquivos do front-end como páginas e templates (htmls dinâmicos), imagens, css etc...
      + serverSide : páginas interpretadas diretamente no servidor (.ejs)
      + clientSide : páginas dinâmicas no cliente, contato via AJAX / RESTFUL (opcional)
