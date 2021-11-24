FROM node:lts-alpine3.13

COPY ./app/backend /backend

WORKDIR /backend
RUN npm install && npm run build
EXPOSE 3001