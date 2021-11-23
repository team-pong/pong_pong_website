FROM node:lts-alpine3.13

COPY ./app/frontend/ /frontend
COPY ./app/backend/ /backend

WORKDIR /frontend
RUN npm install && npm build

WORKDIR /backend
RUN cp -r /frontend/dist /backend/client
RUN npm install && \
    && npm run schema:sync \
    && npm run build
CMD ["sh"]
