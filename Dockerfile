FROM node:alpine
COPY . /app
WORKDIR /app
RUN npm ci
CMD node index.js
