# Docker - App Image Builder
#
# > Executar apos rodar o npm run build <

FROM node:14.18.2-alpine

RUN apk add -U tzdata
RUN cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ./build/package*.json ./

USER node

RUN npm install

COPY --chown=node:node ./build/ ./

EXPOSE 4000
EXPOSE 5000
EXPOSE 5001

ENTRYPOINT [ "npm", "run", "start" ]
