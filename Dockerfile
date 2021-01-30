FROM node:alpine
RUN npm ci
CMD node index.js
