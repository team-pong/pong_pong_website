FROM node:lts-alpine3.13

COPY ./app/backend /backend
COPY ./app/frontend/dist /backend/client

WORKDIR /backend
RUN npm install
EXPOSE 3001