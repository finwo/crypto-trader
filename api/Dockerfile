FROM node:alpine

COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build --if-present

CMD npm run start
