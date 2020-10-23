@echo OFF

cls
echo/
choice /n /c:YN /m "Really start this script? [Y|N]"
echo/

IF ERRORLEVEL ==2 GOTO END_SCRIPT
IF ERRORLEVEL ==1 GOTO START_SCRIPT

:START_SCRIPT

set PATH_HOME_BACK_END=C:\_des\_pessoal\full-stack\boiler-server
set PATH_HOME_FRONT_END=C:\_des\_pessoal\full-stack\boiler-react

set DOCKER_IMAGE_NAME=boiler-deploy:1.0.0
set DOCKER_CONTAINER_NAME=boiler-server
set DOCKER_CONTAINER_PORTS=-p 80:4000 -p 443:5000 -p 5001:5001
set DOCKER_CONTAINER_MEMORY=8192m
set DOCKER_VOLUME_MOUNT=C:/Users/mariede/.docker/boiler-server

echo/
echo Iniciando script...
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
echo ======================================================
echo  1-5 GENERATE FRONT-END BUILD                        #
echo ======================================================
echo/

cd %PATH_HOME_FRONT_END%
IF ERRORLEVEL 1 GOTO ERROR

call npm install
IF ERRORLEVEL 1 GOTO ERROR

call npm run build
IF ERRORLEVEL 1 GOTO ERROR

echo/
echo ======================================================
echo  2-5 GENERATE BACK-END BUILD                         #
echo ======================================================
echo/

cd %PATH_HOME_BACK_END%
IF ERRORLEVEL 1 GOTO ERROR

call npm install
IF ERRORLEVEL 1 GOTO ERROR

call npm run build
IF ERRORLEVEL 1 GOTO ERROR

echo/
echo ======================================================
echo  3-5 PACKING FINAL BUILD IN STATIC PUBLIC FOLDER     #
echo ======================================================
echo/

del "%PATH_HOME_BACK_END%\build\views\client-side\public\*" /Q /S /F
IF ERRORLEVEL 1 GOTO ERROR

xcopy "%PATH_HOME_FRONT_END%\build\" "%PATH_HOME_BACK_END%\build\views\client-side\public\" /E /H
IF ERRORLEVEL 1 GOTO ERROR

echo/
echo ======================================================
echo  4-5 GENERATE DOCKER IMAGE BUILD                     #
echo ======================================================
echo/

call docker build -t %DOCKER_IMAGE_NAME% ./
IF ERRORLEVEL 1 GOTO ERROR

echo/
echo ======================================================
echo  5-5 GENERATE DOCKER CONTAINER BUILD                 #
echo ======================================================
echo/

call docker run -d %DOCKER_CONTAINER_PORTS% --name %DOCKER_CONTAINER_NAME% --restart always --memory %DOCKER_CONTAINER_MEMORY% -v "%DOCKER_VOLUME_MOUNT%/logs:/home/node/app/logs" -v "%DOCKER_VOLUME_MOUNT%/queue:/home/node/app/queue" -v "%DOCKER_VOLUME_MOUNT%/sessions:/home/node/app/sessions" -v "%DOCKER_VOLUME_MOUNT%/uploads:/home/node/app/uploads" %DOCKER_IMAGE_NAME%
IF ERRORLEVEL 1 GOTO ERROR

echo/
echo Script bem sucedido, docker container criado!!!
echo/

GOTO END_SCRIPT

:ERROR

echo/
echo Script encontrou erros...
echo/

:END_SCRIPT

pause
