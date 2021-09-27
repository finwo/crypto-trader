FROM node:alpine as builder
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build --if-present

FROM finwo/quark:latest
COPY --from=builder /app/dist /srv/www
