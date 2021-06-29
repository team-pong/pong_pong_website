FROM node:lts-alpine3.13
WORKDIR /backend

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm install
COPY . .
RUN npm run build

CMD [ "npm", "run", "start:dev" ]