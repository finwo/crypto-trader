FROM node:alpine
COPY . /app
WORKDIR /app
RUN npm ci
RUN npm run build --if-present
RUN cp node_modules/wingcss/dist/*.css public/assets/css
CMD node index.js
