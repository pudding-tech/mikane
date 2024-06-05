### BUILDER ###
FROM node:22-alpine as builder

# Use directory
WORKDIR /app

# Copy packages file and install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# Copy everything
COPY ./ ./

# Build to js
RUN npx tsc -p ./

### FINAL APP ###
FROM node:22-alpine

# Set default environment
ENV NODE_ENV=dev

WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/build ./build
# COPY ./db_scripts ./db_scripts
# COPY ./entrypoint.sh ./
COPY ./public ./public

# Update server API documentation file
ARG SERVER_URL
ARG SERVER_DESCRIPTION
RUN if [ "${SERVER_URL}" ] ; \
  then \
    sed -i "s,http://localhost:3002/api,${SERVER_URL},g" ./build/api.json ; \
  fi
RUN if [ "${SERVER_DESCRIPTION}" ] ; \
  then \
    sed -i "s,Local test server,${SERVER_DESCRIPTION},g" ./build/api.json ; \
  fi

# Expose port 3002
EXPOSE 3002

# Run build
CMD ["node", "build/index.js"]

# Commands for building image and running container (substitute latest with version if building a release):
#   docker build -t mikane:latest ./
#   docker run -d --name mikane --env-file .env mikane:latest

# Save and load image (for transferring to another host) (substitute latest with version if saving a release):
#   docker save -o mikane.tar mikane:latest
#   docker load -i mikane.tar
