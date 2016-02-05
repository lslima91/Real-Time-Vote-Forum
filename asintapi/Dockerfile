FROM node:4.2

ENV NODE_ENV production

COPY . /src
RUN cd /src && npm install

EXPOSE 3000
CMD ["node", "/src/server.js"]


