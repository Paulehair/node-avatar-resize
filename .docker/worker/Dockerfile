FROM node:14.17 as base

WORKDIR /var/www/app
COPY package*.json /
EXPOSE 3001

FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . .
CMD ["node", "server.js"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install
COPY . .
CMD ["yarn", "start"]