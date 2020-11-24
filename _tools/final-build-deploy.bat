@echo OFF

set PATH_HOME_BACK_END=C:\_des\_pessoal\full-stack\boiler-server
set PATH_HOME_FRONT_END=C:\_des\_pessoal\full-stack\boiler-react

set DOCKER_IMAGE_NAME=boiler-deploy:1.0.0
set DOCKER_CONTAINER_NAME=boiler-server
set DOCKER_CONTAINER_PORTS=-p 80:4000 -p 443:5000 -p 5001:5001
set DOCKER_CONTAINER_MEMORY=8192m
set DOCKER_VOLUME_MOUNT=C:/Users/mariede/.docker/boiler-server

REM set DOCKER_HOST=-H tcp://localhost:2375

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

if not exist "%PATH_HOME_BACK_END%\package.json" (
	echo/
	echo Arquivo package.json na pasta definida para o back-end nao encontrado, terminando o processo...
	echo/

	GOTO ERROR
)

if not exist "%PATH_HOME_FRONT_END%\package.json" (
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
choice /n /c:YN /m "Start script to deploy application? [Y|N]"
echo/

IF ERRORLEVEL ==2 GOTO END_SCRIPT
IF ERRORLEVEL ==1 GOTO START_DEPLOY_SCRIPT

:START_DEPLOY_SCRIPT

echo/
echo Iniciando deploy...
echo/

if not exist "%PATH_HOME_BACK_END%\build\package.json" (
	echo/
	echo Arquivo package.json na pasta definida para o build final nao encontrado, terminando o processo...
	echo/

	GOTO ERROR
)

if not exist "%PATH_HOME_BACK_END%\build\views\client-side\public\config.json" (
	echo/
	echo Arquivo config.json - front-end - nao encontrado, terminando o processo...
	echo/

	GOTO ERROR
)

echo/
echo ================================================================
echo  1-2 GENERATE DOCKER IMAGE BUILD                               #
echo ================================================================
echo/

cd %PATH_HOME_BACK_END%
IF ERRORLEVEL 1 GOTO ERROR

call docker %DOCKER_HOST% build -t %DOCKER_IMAGE_NAME% ./
IF ERRORLEVEL 1 GOTO ERROR

echo/
echo ================================================================
echo  2-2 GENERATE DOCKER CONTAINER BUILD                           #
echo ================================================================
echo/

call docker %DOCKER_HOST% run -d %DOCKER_CONTAINER_PORTS% --name %DOCKER_CONTAINER_NAME% --restart always --memory %DOCKER_CONTAINER_MEMORY% -v "%DOCKER_VOLUME_MOUNT%/logs:/home/node/app/logs" -v "%DOCKER_VOLUME_MOUNT%/queue:/home/node/app/queue" -v "%DOCKER_VOLUME_MOUNT%/sessions:/home/node/app/sessions" -v "%DOCKER_VOLUME_MOUNT%/uploads:/home/node/app/uploads" %DOCKER_IMAGE_NAME%
IF ERRORLEVEL 1 GOTO ERROR

echo/
echo ================================================================
echo  - Procedimento bem sucedido, image / container criados !!!    #
echo ================================================================
echo/

GOTO END_SCRIPT

:ERROR

echo/
echo Script encontrou erros...
echo/

:END_SCRIPT

pause >nul