FROM node:alpine

WORKDIR /app

COPY package*.json ./
COPY . .

RUN yarn install
RUN yarn run build

RUN mkdir -p static/images uploads
RUN chown -R node:node /app static uploads
USER node

CMD ["yarn", "run", "start:prod"]
