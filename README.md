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

## Servidor http
  - Clusterização opcional
  - CORS
  - favicon
  - body parser
  - cookie parser
  - compression
  - Pastas de arquivo estáticos (imagens, css ...)
  - Permite aplicações RESTFUL
  - Permite APIs de terceiros
## Arquivo de configuração unificado do servidor
  - config.json
  - Gerenciamento em tempo real do arquivo de configuração
  - Diversos parâmetros reunidos para configuração do servidor
## Estrutura de código com pontos definidos de entrada / saída
  - Roteamento em camadas
  - Tratamento conjunto da pilha de Erros (sync e async)
  - Erros personalizados
## Prefixamento de rotas e Proxy geral de acesso (via porta 80)
  - Prefixo configurável, atua em todas as rotas do servidor
  - _tools/proxy/_proxyStart.js
## Websockets configurado junto ao servidor http
  - Conversação bidirecional cliente <-> servidor
  - Biblioteca Socket.io (websockets / pooling)
  - Integrado com a aplicação, mas com processo próprio em porta separada
  - Proxy automático, direto pela aplicação
  - Funciona normalmente single-thread e multi-thread (cluster)
## Possibilidade de utilizar a aplicação como serviço do Windows ou via "Forever"
  - Pacote node-windows
    - Inicia junto com a máquina
    - Serviço reinicia automaticamente, se houver problemas
    - _tools/node_as_a_service/_nodeAsAService.js
  - Pacote Forever (instalar global)
    - Funciona em Windows ou Linux
## Sessions com armazenamento via arquivos criptografados
  - sessionFileStore
  - Utiliza o sistema de arquivos
## Logs com informações na tela e/ou arquivos diários de logs
  - Arquivos separados de logs por grupos
    - Logs de inicialização e acessos ao servidor
    - Logs de erros
    - Logs de uso da fila de e-mails
## Autenticação das rotas personalizável
  - Lib de autenticação
    - Rotas protegidas (configurável)
    - isLogged
    - Login / Logout
## Lib de acesso a bancos de dados
  - Parametrizável para MS SQL Server
    - Transacional, acesso a múltiplas queries e stored procedures, variáveis de output, etc
  - Parametrizável para MongoDB
    - Transacional, via esquemas Mongoose, índices compostos, noSql, etc
## Paginador e Ordenador (Paginator & Sorter)
  - Com opções configuráveis, items_per_page, current_page, total_pages, ASC/DESC, ordenação por mais de uma coluna, etc
  - Conversão configurável "Camel Case" do json (record set de retorno)
## Lib Searcher
  - Facilita as consultas em geral com algorítmo unificado de pesquisa
## Lib validator
  - Com os métodos de validação de entradas mais comuns (cpf, alfanumérico, e-mail), personalizável via regex
## Criptografia
  - Hash e Cipher
## Uploader
  - Upload de grupos de arquivos com filtros por tamanho, quantidade de arquivos, extensão, MIME types, ...
  - MULTER: Upload direto para memória ou pastas específicas no servidor
## Email
  - Envio de e-mails, com anexos, direto e/ou por chunks asyncs e/ou enfileirados em pasta no servidor
  - NODEMAILER: Configuração abrangente
  - Templates de e-mail dinâmicos
  - Serviço cíclico assíncrono, gerencia o envio dos e-mails enfileirados
## Engine de templates para expor arquivos html dinâmicos
  - EJS - Embedded Javascript Templates (semelhante ao asp)
  - Acoplado ao sistema de views do Express
## Build gerável
  - Através do Webpack
  - Validação de código ESLINT
## Estrutura das pasta do servidor
  - actions : métodos com as regras de negócio e codificação dos processos
    - é local, relacionado a rota em execução
    - uma action pode chamar uma ou mais actions e/ou um ou mais helpers
  - custom : pasta com APIs de interfaceamento para outros serviços externos
    - é como um helper interfaceando exclusivamente serviços externos
  - helpers : métodos com as regras de negócio e codificação dos processos
    - é global, relacionado ao projeto e pode ser utilizado por qualquer action ou middleware
    - um helper pode chamar um ou mais helpers
  - logs
    - arquivos de logs do servidor
  - models
    - arquivo contendo os esquemas de acesso ao mongoDB, via mongoose
  - queue (* opcional, configurável)
    - arquivos da fila de e-mails (e-mails agendados a serem enviados)
  - routes
    - define um ou mais controllers para o projeto
    - define as rotas do servidor
    - ponto centralizador do contato client/server
      - todas requisição/retorno do cliente é realizado aqui
  - server
    - arquivos de inicialização do servidor e assistência ao seu funcionamento
  - sessions
    - arquivos contendo as sessões ativas
  - uploads (* opcional, configurável)
    - contém pastas e arquivos de upload dos clientes
  - views : arquivos do front-end como páginas e templates (htmls dinâmicos), imagens, css etc...
    - serverSide : páginas interpretadas diretamente no servidor (.ejs)
    - clientSide : páginas dinâmicas no cliente, contato via AJAX / RESTFUL (opcional)
