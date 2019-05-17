# node-boiler-server (boiler para servidor web NODE / Express)

## Servidor http
  - CORS
  - favicon
  - body parser
  - compression
## Arquivo de configuração unificado do servidor
  - config.json
  - Gerenciamento em tempo real do arquivo de configuração
## Roteamento em camadas
## Estrutura de código com pontos definidos de entrada / saída
  - Tratamento de Erros (sync e async)
## Proxy de acesso
  - proxyStart.js
## Sessions com armazenamento via arquivos criptografados
  - sessionFileStore
## Logs com informações na tela e/ou arquivos diários de log
## Autenticação das rotas personalizável
  - Lib de autenticação
    - Rotas protegidas
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
## Build gerável
  - Através do Webpack
  - Validação de código ESLINT
