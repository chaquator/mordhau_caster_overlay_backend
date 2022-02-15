FROM node:17-slim

# Install packages
WORKDIR /app
COPY package.json /app
RUN npm install

# Copy pre-built frontend from /public
COPY ./public /app/public

# Copy backend source
COPY . /app

# Environment vars
ENV NODE_ENV=production
ENV STANDALONE=true

ENTRYPOINT npm start
