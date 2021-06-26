FROM node:lts-alpine3.13
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

CMD [ "npm", "run", "start:dev" ]