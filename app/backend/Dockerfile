FROM node:lts-alpine3.13
WORKDIR /backend

COPY . .
RUN npm install
RUN npm run build

CMD [ "npm", "run", "start:dev" ]