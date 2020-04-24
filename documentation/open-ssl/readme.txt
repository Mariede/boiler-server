1) Download Win64OpenSSL:
	-> gerador de certificados digitais selfsigned
	-> https://slproweb.com/download/Win64OpenSSL-1_1_1f.exe

2) Instalar Win64OpenSSL:
	-> caminho padrão para o executável openssl.exe: C:\Program Files\OpenSSL-Win64\bin
	-> copiar OpenSSL DLLs, binários para a pasta \bin

3) Caminho deve ser salvo como variável de ambiente de sistema no windows (Path).

4) Definir uma pasta específica e criar arquivo de requisição do certificado (configuração):
	-> pasta específica: security
	-> arquivo de requisição: req.cnf

5) Abrir terminal e navegar até a pasta específica. Executar comando para geração do certificado:
	-> pasta específica: security
	-> comando: openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout cert.key -out cert.pem -config req.cnf -sha256

6) Exemplo:
	-> https://stackoverflow.com/questions/21397809/create-a-trusted-self-signed-ssl-cert-for-localhost-for-use-with-express-node

7) Certificado gerado, arquivos:
	-> chave privada: cert.key
	-> certificado: cert.pem

8) Certificado exportado pelo navegador Chrome, para importação em Autoridades de Certificação Raíz Confiáveis:
	-> chromeExportedCert.cer
	-> identificado como: www.localhost.com
	-> apenas para Google Chrome
