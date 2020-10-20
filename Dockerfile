# Docker - App Image Builder
#
# > Executar apos rodar o npm run build <

FROM node:12.19-alpine
ARG build_version

RUN apk add -U tzdata
RUN cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ./build/${build_version}/package*.json ./

USER node

RUN npm install

COPY --chown=node:node ./build/${build_version}/ ./

EXPOSE 4000
EXPOSE 5000
EXPOSE 5001

ENTRYPOINT [ "npm", "run", "start" ]
