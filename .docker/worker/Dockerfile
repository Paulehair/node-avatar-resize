FROM node:14.17 as base

WORKDIR /var/www/app
COPY package*.json .
EXPOSE 3001

FROM base as dev
ENV NODE_ENV=development
RUN yarn
COPY . .
CMD ["yarn", "start"]