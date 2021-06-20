FROM node:14.17 as base

WORKDIR /var/www/app
COPY package*.json /
EXPOSE 3000

FROM base as dev
ENV NODE_ENV=development
RUN yarn
COPY . .
CMD ["yarn", "start"]