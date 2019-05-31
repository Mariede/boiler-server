# node-boiler-server (boiler para servidor web NODE / Express)

## Servidor http
  - CORS
  - favicon
  - body parser
  - cookie parser
  - compression
## Arquivo de configuração unificado do servidor
  - config.json
  - Gerenciamento em tempo real do arquivo de configuração
## Estrutura de código com pontos definidos de entrada / saída
  - Roteamento em camadas
  - Tratamento de Erros (sync e async)
## Proxy de acesso
  - proxyStart.js
## Sessions com armazenamento via arquivos criptografados
  - sessionFileStore
## Logs com informações na tela e/ou arquivos diários de log
  - log4js
## Autenticação das rotas personalizável
  - Lib de autenticação
    - Rotas protegidas (configurável)
    - isLogged
    - Login / Logout
## Lib parametrizada para o MS SQL Server
  - Transacional, acesso a queries e stored procedures, variáveis de output, etc
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
  - Upload de grupos de arquivos com filtros por tamanho, quantidade de arquivos, extensão, MIME types, ... configurável
  - MULTER: Upload direto para memória ou pastas específicas no servidor
## Email
  - Envio de e-mails, com anexos, direto e/ou por chunks asyncs e/ou enfileirados em pasta no servidor
  - NODEMAILER: Configuração abrangente
  - Templates de e-mail dinâmicos
## Engine de templates para expor arquivos html dinâmicos
  - EJS - Embedded Javascript Templates (semelhante ao asp)
  - Acoplado ao sistema de views do Express
## Build gerável
  - Através do Webpack
  - Validação de código ESLINT
