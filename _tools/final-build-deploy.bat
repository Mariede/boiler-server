@echo OFF

set PATH_HOME=C:\_Projetos\_full-stack
set PATH_HOME_BACK_END=%PATH_HOME%\boiler-server
set PATH_HOME_FRONT_END=%PATH_HOME%\boiler-react

set DOCKER_WEB_IMAGE_NAME=boiler-deploy:1.0.0
set DOCKER_WEB_IMAGE_SAVED=boiler-deploy-1.0.0
set DOCKER_WEB_CONTAINER_NAME=boiler-server
set DOCKER_WEB_CONTAINER_MEMORY=8192m
set DOCKER_WEB_VOLUME_MOUNT=C:/Users/mariede/.docker/_web/boiler-server
set DOCKER_DB_VOLUME_MOUNT=C:/users/mariede/.docker/_db/mssql-boiler-server

cls
echo/
choice /n /c:YN /m "Start script to build application? [Y|N]"
echo/

IF ERRORLEVEL ==2 GOTO CHECK_DEPLOY_SCRIPT
IF ERRORLEVEL ==1 GOTO START_BUILD_SCRIPT

:START_BUILD_SCRIPT

echo/
echo Iniciando build final...
echo/

IF NOT EXIST "%PATH_HOME_BACK_END%\package.json" (
	echo/
	echo Arquivo package.json na pasta definida para o back-end nao encontrado, terminando o processo...
	echo/

	GOTO ERROR
)

IF NOT EXIST "%PATH_HOME_FRONT_END%\package.json" (
	echo/
	echo Arquivo package.json na pasta definida para o front-end nao encontrado, terminando o processo...
	echo/

	GOTO ERROR
)

echo/
echo ================================================================
echo  1-3 GENERATE FRONT-END BUILD                                  #
echo ================================================================
echo/

cd %PATH_HOME_FRONT_END%
IF ERRORLEVEL 1 GOTO ERROR

call npm install
IF ERRORLEVEL 1 GOTO ERROR

call npm run build
IF ERRORLEVEL 1 GOTO ERROR

echo/
echo ================================================================
echo  2-3 GENERATE BACK-END BUILD                                   #
echo ================================================================
echo/

cd %PATH_HOME_BACK_END%
IF ERRORLEVEL 1 GOTO ERROR

call npm install
IF ERRORLEVEL 1 GOTO ERROR

call npm run build
IF ERRORLEVEL 1 GOTO ERROR

echo/
echo ================================================================
echo  3-3 PACKING FINAL BUILD IN STATIC PUBLIC FOLDER               #
echo ================================================================
echo/

del "%PATH_HOME_BACK_END%\build\views\client-side\public\*" /Q /S /F
IF ERRORLEVEL 1 GOTO ERROR

xcopy "%PATH_HOME_FRONT_END%\build\" "%PATH_HOME_BACK_END%\build\views\client-side\public\" /E /H
IF ERRORLEVEL 1 GOTO ERROR

echo/
echo ================================================================
echo  - Procedimento bem sucedido, build final criada !!!           #
echo ================================================================
echo/

:CHECK_DEPLOY_SCRIPT

echo/
choice /n /c:YN /m "Start script to deploy application? Remember to check your config.json files... [Y|N]"
echo/

IF ERRORLEVEL ==2 GOTO END_SCRIPT
IF ERRORLEVEL ==1 GOTO START_DEPLOY_SCRIPT

:START_DEPLOY_SCRIPT

echo/
echo Iniciando deploy...
echo/

IF NOT EXIST "%PATH_HOME_BACK_END%\build\package.json" (
	echo/
	echo Arquivo package.json na pasta definida para o build final nao encontrado, terminando o processo...
	echo/

	GOTO ERROR
)

IF NOT EXIST "%PATH_HOME_BACK_END%\build\views\client-side\public\config.json" (
	echo/
	echo Arquivo config.json - front-end - nao encontrado, terminando o processo...
	echo/

	GOTO ERROR
)

echo/
echo ================================================================
echo  1-1 GENERATE DOCKER-COMPOSE BUILD                             #
echo ================================================================
echo/

cd %PATH_HOME_BACK_END%
IF ERRORLEVEL 1 GOTO ERROR

call docker-compose build --no-cache --pull
IF ERRORLEVEL 1 GOTO ERROR

IF NOT EXIST "%PATH_HOME%\images" (
	mkdir "%PATH_HOME%\images"
	IF ERRORLEVEL 1 GOTO ERROR
)

call docker save -o "%PATH_HOME%\images\%DOCKER_WEB_IMAGE_SAVED%.tar" %DOCKER_WEB_IMAGE_NAME%
IF ERRORLEVEL 1 GOTO ERROR

REM call docker-compose up -d --force-recreate
REM IF ERRORLEVEL 1 GOTO ERROR

echo/
echo ================================================================
echo  - Procedimento bem sucedido, imagem criada e salva !!!        #
echo ================================================================
echo/

GOTO END_SCRIPT

:ERROR

echo/
echo Script encontrou erros...
echo/

:END_SCRIPT

pause >nul
