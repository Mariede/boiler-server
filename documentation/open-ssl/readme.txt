1) Download Win64OpenSSL:
	-> gerador de certificados digitais selfsigned
	-> https://slproweb.com/download/Win64OpenSSL-1_1_1f.exe

2) Instalar Win64OpenSSL:
	-> caminho padrão para o executável openssl.exe: C:\Program Files\OpenSSL-Win64\bin
	-> copiar OpenSSL DLLs, binários para a pasta \bin

3) Caminho deve ser salvo como variável de ambiente de sistema no windows (Path).

4) Definir uma pasta específica e criar arquivo de requisição do certificado (configuração):
	-> A extensão .pem é utilizada para diferentes arquivos tipo X.509v3 (Base64) e começam por “—– BEGIN …”
	-> pasta: ./PEM
	-> arquivo de requisição: req.cnf

5) Abrir terminal e navegar até a pasta específica. Executar comando para geração do certificado:
	-> pasta: ./PEM
	-> comando: openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout cert.key -out cert.pem -config req.cnf -sha256

6) Exemplo:
	-> https://stackoverflow.com/questions/21397809/create-a-trusted-self-signed-ssl-cert-for-localhost-for-use-with-express-node

7) Certificado gerado, arquivos:
	-> chave privada: cert.key
	-> certificado: cert.pem

8) Exportações:

	8.1) Exportar para CER: via navegador Chrome, para importação em Autoridades de Certificação Raíz Confiáveis:
		-> chromeExportedCert.cer
		-> identificado como: www.localhost.com
		-> apenas para Google Chrome

	8.2) Exportar para PFX: openssl pkcs12 -export -inkey ../cert.key -in ../cert.pem -out cert.pfx
		-> Caminho para cert.key e cert.pem configurável
		-> Export Password: 123
