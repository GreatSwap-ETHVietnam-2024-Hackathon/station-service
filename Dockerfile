# Dockerfile-station-service

FROM node:18

WORKDIR /station-service

COPY ./package*.json ./
RUN npm install

COPY . .
CMD npm run typechain-build && npm run start-prod