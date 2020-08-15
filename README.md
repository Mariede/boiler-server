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
  * Headers de segurança
  * Pastas de arquivos estáticos (imagens, css, front-end ...)
  * Permite aplicações RESTFUL com single page applications (SPA)
  * Permite APIs de terceiros
  * Monitoramento do loop de eventos para análises de performance e testes
    - Opcional
  * Permite redirecionamento automático http para https, se necessário

## Arquivo de configuração unificado
  * config.json
  * Gerenciamento em tempo real do arquivo de configuração
  * Diversos parâmetros reunidos para configuração do servidor
    - server: configurações gerais do servidor
    - auth: configurações gerais para as regras de autenticação do servidor (permissões de acesso)
    - socketIo: configurações gerais do servidor de socket.io (websockets / pooling)
    - crypto: configurações gerais de criptografia
    - db: configurações gerais de acesso ao banco de dados (MSSQL ou MongoDB)
    - email: configurações gerais de disparo de e-mails, incluindo queue

## Estrutura de código com pontos definidos de entrada / saída
  * Roteamento em camadas
  * Tratamento conjunto da pilha de Erros (sync e async)
  * Erros personalizados, nas camadas com as regras de negócio (message) ou diretamente no controller (customMessage)
  * Opção de enviar o stackTrace de erros para o cliente (default falso)

## Rotas padrão
  * Rotas protegidas ou abertas - via lib de autenticação (configurável em config.json)
    - /islogged
      + verifica se usuário autenticado
    - /logon e /logout
      + acesso a sistemas controlados
    - /server
      + informa detalhes do servidor e teste de socket.io
    - /egg
      + easter egg :neckbeard:

## Prefixamento de rotas
  * Prefixo configurável, atua em todas as rotas da aplicação
  * Funciona também em requisições socket.io (websockets / pooling)

## Socket.io configurado junto ao servidor http / https
  * Conversação bidirecional cliente <-> servidor
  * Biblioteca socket.io (websockets / pooling)
  * Integrado com a aplicação, mas com servidor próprio em porta separada
  * Redirecionamento automático, proxy acoplado internamento no servidor web
  * Funciona normalmente single-thread e multi-thread (cluster)
  * Trabalha http ou https (ws ou wss), baseado na requisição web

## Possibilidade de utilizar a aplicação como serviço nativo do Windows ou via "Forever"
  * Pacote node-windows
  * Pacote Forever

## Sessions com armazenamento via arquivos criptografados
  * sessionFileStore
  * Utiliza o sistema de arquivos

## Logs com informações na tela e/ou arquivos diários
  * Arquivos de logs separados por grupos
    - Inicialização e acessos ao servidor
    - Erros originários dos controllers
    - Fila de e-mails
    - Acessos e modificações no arquivo de configuração (config.json)

## Lib de acesso a bancos de dados
  * Parametrizável para MS SQL Server
    - Transacional, acesso a múltiplas queries e stored procedures, agrupadas ou desmembradas, variáveis de output, etc
    - Saída formatada
  * Parametrizável para MongoDB
    - Transacional, via esquemas Mongoose, índices compostos por esquemas, opções extras por esquemas, noSql, etc
    - Saída formatada

## Lib Paginator com paginador e ordenador
  * Configuráveis, items_per_page, current_page, total_pages, ASC/DESC, ordenação por mais de uma coluna, etc
  * "Sort" inteligente, levando em conta a "collation" nas ordenações
  * Conversão configurável para "camelCase" e string para "nested objects" do json (recordset de retorno)
  * Requisição via query params - page, items_per_page, sort_fields, sort_case_insensitive
  * Compatível com componentes Paginator e Sorter no front-end boiler-react

## Lib Searcher
  * Facilita as consultas em geral com algorítmo unificado de pesquisa em múltiplas colunas
  * Apenas para MS SQL Server
  * Requisição via query params - fullsearch_fields, fullsearch_value

## Lib Validator
  * Com os métodos de validação de entradas mais comuns (cpf, alfanumérico, e-mail), personalizável via regex

## Lib de Criptografia
  * Salt, Hash e Cipher (Encrypt / Decrypt)

## Lib Uploader
  * Upload de grupos de arquivos com filtros por tamanho, quantidade de arquivos, extensão, MIME types, ...
  * MULTER: Upload direto para memória ou pastas específicas no servidor
  * Erros personalizados

## Lib Email + Queue
  * Envio de e-mails, com anexos, direto e/ou por chunks asyncs e/ou enfileirados em pasta no servidor
  * NODEMAILER: Configuração abrangente
  * Templates de e-mail dinâmicos
  * Filas de e-mails agendados
    - Serviço cíclico e assíncrono
    - Permite cluster ou thread única
    - Gerencia o envio dos e-mails enfileirados

## Lib Functions
  * Com métodos genéricos para acesso global (forEach async, promises ordenadas, generateUniqueId, etc)

## Lib Image
  * Para manipulação e compressão de imagens
  * GIF, JPEG, PNG, TIFF, SVG e WebP
  * SHARP: lib de alta performance

## Engine de templates para expor arquivos html dinâmicos
  * EJS - Embedded Javascript Templates (semelhante ao asp)
  * Acoplado ao sistema de views do Express
  * Essas páginas são montadas diretamente pelo servidor
    - Servidas em pasta separada de uma aplicação front-end estática, como uma SPA (server-side ou client-side)

## Build gerável
  * Através do Webpack
  * Validação de código ESLINT

## Estrutura das pastas do servidor
  * actions
    - métodos com as regras de negócio e codificação dos processos
      + é local, relacionado a rota em execução
      + uma action pode chamar uma ou mais actions e/ou um ou mais helpers
    - as actions podem ser quebradas em subpastas, componentizadas após os controllers
      + pasta actions/base contém métodos relacionados as rotas base do boiler (página inicial e autenticação padrão)
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
  * lib-com
    - pasta com conteúdo complementar programável das libs, desacoplado do núcleo das mesmas
      + mongoose-schemas.js
        * arquivo contendo os esquemas de acesso ao mongoDB e detalhes relacionados, via mongoose
      + socket-io-listeners.js
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
      + pasta routes/controllers/base contém as rotas base do boiler (página inicial e autenticação padrão)
  * server
    - arquivos de inicialização do servidor e assistência ao seu funcionamento
    - núcleo do servidor, transparente para os projetos
  * sessions (* cria automático, se não existir)
    - arquivos contendo as sessões ativas
  * uploads (* opcional, configurável, cria automático - se não existir)
    - contém pastas e arquivos de upload dos clientes
  * views
    - arquivos do front-end como páginas e templates (htmls dinâmicos), imagens, css etc...
      + server-side : páginas interpretadas diretamente no servidor (.ejs)
        * caminho para o motor de páginas: /server-side/pages
      + client-side : páginas dinâmicas no cliente, contato via AJAX / RESTFUL (opcional)
        * caminho para pasta pública: /client-side/public
