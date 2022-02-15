FROM node:17-slim

# Install packages
WORKDIR /app
COPY package.json /app
RUN npm install

# Copy public files
COPY ./public /app/public

# Copy source files
COPY ./src /app/src

# Environment vars
ENV NODE_ENV=production
ENV STANDALONE=true

ENTRYPOINT npm start
